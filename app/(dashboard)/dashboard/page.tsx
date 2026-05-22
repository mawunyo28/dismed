"use client"

import { useEffect, useState, useCallback } from "react"
import { User, Clock, Pill, CheckCircle, AlertTriangle, Play, HardDrive, Wifi, Battery } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  full_name: string | null
}

interface Device {
  id: string
  label: string | null
  is_online: boolean
  last_seen_at: string | null
}

interface Compartment {
  id: string
  slot: number
  medication_name: string | null
  dosage_mg: number | null
  pill_count: number
  capacity: number
}

interface Schedule {
  id: string
  dispense_time: string     // "HH:MM:SS"
  days_of_week: number[]
  pills_per_dose: number
  active: boolean
  compartment_id: string
  compartments: { slot: number; medication_name: string | null; dosage_mg: number | null }
}

interface DispenseEvent {
  id: string
  slot: number | null
  status: string
  dispensed_at: string
  compartments: { medication_name: string | null } | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt12(time: string) {
  const [h, m] = time.split(":").map(Number)
  const suffix = h >= 12 ? "PM" : "AM"
  const h12 = ((h % 12) || 12).toString().padStart(2, "0")
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`
}

function relativeTime(iso: string | null) {
  if (!iso) return "Never"
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const SLOT_COLORS: Record<number, string> = {
  1: "border-blue-300 bg-blue-50 text-blue-800",
  2: "border-violet-300 bg-violet-50 text-violet-800",
  3: "border-emerald-300 bg-emerald-50 text-emerald-800",
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [device, setDevice] = useState<Device | null>(null)
  const [compartments, setCompartments] = useState<Compartment[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [recentEvents, setRecentEvents] = useState<DispenseEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dispensing, setDispensing] = useState<string | null>(null) // compartment id currently being triggered

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const [
      { data: profileData },
      { data: deviceData },
    ] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).single(),
      supabase.from("devices").select("id, label, is_online, last_seen_at").eq("owner_id", user.id).limit(1).single(),
    ])

    setProfile(profileData)

    if (!deviceData) { setLoading(false); return }
    setDevice(deviceData)

    const [
      { data: comps },
      { data: scheds },
      { data: events },
    ] = await Promise.all([
      supabase.from("compartments").select("*").eq("device_id", deviceData.id).order("slot"),
      supabase.from("schedules")
          .select("*, compartments(slot, medication_name, dosage_mg)")
          .eq("device_id", deviceData.id)
          .eq("active", true)
          .order("dispense_time"),
      supabase.from("dispense_events")
          .select("id, slot, status, dispensed_at, compartments(medication_name)")
          .eq("device_id", deviceData.id)
          .order("dispensed_at", { ascending: false })
          .limit(8),
    ])

    setCompartments(comps ?? [])
    setSchedules((scheds as unknown as Schedule[]) ?? [])
    setRecentEvents((events as unknown as DispenseEvent[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  // ── Manual dispense ────────────────────────────────────────────────────────
  // Inserts a row into dispense_commands. The ESP32 polls this table.

  const manualDispense = async (comp: Compartment) => {
    if (!device) return
    setDispensing(comp.id)
    const { error } = await supabase.from("dispense_commands").insert({
      device_id: device.id,
      slot: comp.slot,
      status: "pending",
    })
    if (error) {
      toast.error("Failed to send command: " + error.message)
    } else {
      toast.success(`Dispense command sent for slot ${comp.slot} (${comp.medication_name})`)
    }
    setDispensing(null)
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const today = new Date()
  const todayDow = today.getDay() // 0=Sun
  const todaySchedules = schedules.filter(s => s.days_of_week.includes(todayDow))

  const missedCount = recentEvents.filter(e => e.status === "missed").length
  const filledComps = compartments.filter(c => c.medication_name)

  const firstName = profile?.full_name?.split(" ")[0] ?? "there"

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {firstName}. {todaySchedules.length > 0
              ? `${todaySchedules.length} dose${todaySchedules.length !== 1 ? "s" : ""} scheduled today.`
              : "No doses scheduled today."}
          </p>
        </div>

        {loading ? (
            <p className="text-muted-foreground">Loading…</p>
        ) : !device ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                <HardDrive className="size-12 text-muted-foreground" />
                <div>
                  <p className="font-semibold">No dispenser linked yet</p>
                  <p className="text-sm text-muted-foreground">
                    Register your ESP32 device from the <Link href="/devices" className="underline">Devices page</Link>.
                  </p>
                </div>
              </CardContent>
            </Card>
        ) : (
            <>
              {/* Device status bar */}
              <Card className={cn("border", device.is_online ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50")}>
                <CardContent className="flex items-center gap-4 py-3">
                  <div className={cn("size-2.5 rounded-full", device.is_online ? "bg-green-500" : "bg-red-500")} />
                  <div className="flex-1">
                    <span className="font-medium">{device.label ?? device.id}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                  · Last seen {relativeTime(device.last_seen_at)}
                </span>
                  </div>
                  <Link href="/dispenser">
                    <Button variant="outline" size="sm">Device Details →</Button>
                  </Link>
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left/main column */}
                <div className="flex flex-col gap-6 lg:col-span-2">
                  {/* Compartments + manual dispense */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="size-5" />
                        Compartments
                      </CardTitle>
                      <CardDescription>
                        3 physical slots in your dispenser. Click <strong>Dispense</strong> to trigger a slot manually.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      {[1, 2, 3].map(slot => {
                        const c = compartments.find(x => x.slot === slot)
                        const pct = c ? (c.pill_count / c.capacity) * 100 : 0
                        const low = c && c.pill_count / c.capacity < 0.2
                        return (
                            <div
                                key={slot}
                                className={cn(
                                    "flex items-center gap-4 rounded-lg border p-4",
                                    c?.medication_name ? SLOT_COLORS[slot] : "border-dashed bg-muted/30"
                                )}
                            >
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/70 font-bold text-sm shadow-sm">
                                {slot}
                              </div>
                              <div className="flex-1 min-w-0">
                                {c?.medication_name ? (
                                    <>
                                      <p className="font-semibold truncate">{c.medication_name}</p>
                                      <p className="text-sm text-muted-foreground">{c.dosage_mg} mg</p>
                                      <div className="mt-1 flex items-center gap-2">
                                        <Progress value={pct} className={cn("h-1.5 w-24", low && "[&>div]:bg-amber-500")} />
                                        <span className="text-xs text-muted-foreground">{c.pill_count} pills left</span>
                                        {low && <Badge className="bg-amber-100 text-amber-700 text-xs">Low</Badge>}
                                      </div>
                                    </>
                                ) : (
                                    <p className="italic text-muted-foreground text-sm">
                                      Empty — <Link href="/medications" className="underline">Set up medication</Link>
                                    </p>
                                )}
                              </div>
                              {c?.medication_name && (
                                  <Button
                                      size="sm"
                                      disabled={dispensing === c.id || !device.is_online}
                                      onClick={() => manualDispense(c)}
                                  >
                                    <Play className="mr-1.5 size-3.5" />
                                    {dispensing === c.id ? "Sending…" : "Dispense"}
                                  </Button>
                              )}
                            </div>
                        )
                      })}
                      {!filledComps.length && (
                          <p className="py-4 text-center text-sm text-muted-foreground">
                            No medications configured. <Link href="/medications" className="underline">Add them now →</Link>
                          </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Today's schedule */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="size-5" />
                          Today's Schedule
                        </CardTitle>
                        <Link href="/schedules">
                          <Button variant="outline" size="sm">Manage Schedules</Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      {todaySchedules.length === 0 ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">
                            No schedules for today. <Link href="/schedules" className="underline">Create one →</Link>
                          </p>
                      ) : todaySchedules.map(s => (
                          <div key={s.id} className="flex items-center gap-4 rounded-lg border p-3">
                            <p className="w-20 shrink-0 font-semibold tabular-nums">{fmt12(s.dispense_time)}</p>
                            <div className="flex-1">
                              <p className="font-medium">{s.compartments?.medication_name ?? `Slot ${s.compartments?.slot}`}</p>
                              <p className="text-xs text-muted-foreground">
                                {s.compartments?.dosage_mg} mg · {s.pills_per_dose} pill{s.pills_per_dose !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">Slot {s.compartments?.slot}</Badge>
                          </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Right sidebar */}
                <div className="flex flex-col gap-6">
                  {/* Recent dispense events */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="size-5" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      {recentEvents.length === 0 ? (
                          <p className="py-4 text-center text-sm text-muted-foreground">No dispense events yet.</p>
                      ) : recentEvents.map(e => (
                          <div key={e.id} className="flex items-start gap-3">
                            {e.status === "success" && <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-600" />}
                            {e.status === "missed"  && <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />}
                            {e.status === "jammed"  && <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />}
                            {e.status === "manual"  && <Play className="mt-0.5 size-4 shrink-0 text-blue-600" />}
                            <div>
                              <p className="text-sm font-medium">
                                {e.compartments?.medication_name ?? `Slot ${e.slot}`}
                                {" "}<span className="capitalize text-muted-foreground font-normal">({e.status})</span>
                              </p>
                              <p className="text-xs text-muted-foreground">{relativeTime(e.dispensed_at)}</p>
                            </div>
                          </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Low stock alerts */}
                  {compartments.some(c => c.pill_count / c.capacity < 0.2 && c.medication_name) && (
                      <Card className="border-amber-200 bg-amber-50">
                        <CardContent className="flex flex-col gap-2 py-4">
                          <p className="font-semibold text-amber-900 flex items-center gap-2">
                            <AlertTriangle className="size-4" /> Low Stock
                          </p>
                          {compartments
                              .filter(c => c.pill_count / c.capacity < 0.2 && c.medication_name)
                              .map(c => (
                                  <p key={c.id} className="text-sm text-amber-800">
                                    Slot {c.slot} · {c.medication_name}: {c.pill_count} pills remaining
                                  </p>
                              ))}
                        </CardContent>
                      </Card>
                  )}

                  {/* Quick links */}
                  <Card>
                    <CardContent className="flex flex-col gap-2 py-4">
                      {[
                        { label: "Manage Medications", href: "/medications" },
                        { label: "Edit Schedules", href: "/schedules" },
                        { label: "Device Details", href: "/dispenser" },
                        { label: "Symptom Checker", href: "/symptom-checker" },
                      ].map(a => (
                          <Link key={a.label} href={a.href}>
                            <Button variant="ghost" className="w-full justify-start">{a.label}</Button>
                          </Link>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
        )}
      </div>
  )
}