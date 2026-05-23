"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  HardDrive, Wifi, WifiOff, RefreshCw, Play, Clock,
  CheckCircle, XCircle, AlertTriangle, Loader2, Zap,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Device {
  id: string
  label: string | null
  is_online: boolean
  last_seen_at: string | null
  firmware: string | null
}

interface Compartment {
  id: string
  slot: number
  medication_name: string | null
  pill_count: number
  capacity: number
}

interface DispenseEvent {
  id: string
  slot: number | null
  status: string
  triggered_by: string
  dispensed_at: string
  compartments: { medication_name: string | null } | null
}

interface DispenseCommand {
  id: string
  slot: number
  status: string
  created_at: string
  executed_at: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string | null) {
  if (!iso) return "Never"
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(iso).toLocaleDateString()
}

const SLOT_COLORS: Record<number, string> = {
  0: "bg-gray-100 border-gray-300",
  1: "bg-blue-50 border-blue-200",
  2: "bg-violet-50 border-violet-200",
  3: "bg-emerald-50 border-emerald-200",
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DispenserPage() {
  const supabase = useMemo(() => createClient(), [])

  const [device, setDevice] = useState<Device | null>(null)
  const [compartments, setCompartments] = useState<Compartment[]>([])
  const [events, setEvents] = useState<DispenseEvent[]>([])
  const [pendingCommands, setPendingCommands] = useState<DispenseCommand[]>([])
  const [loading, setLoading] = useState(true)

  // Demo dialog state
  const [showDemo, setShowDemo] = useState(false)
  const [demoSlot, setDemoSlot] = useState<0 | 1 | 2 | 3>(0)   // 0 = all
  const [sendingDemo, setSendingDemo] = useState(false)

  // Manual dispense state
  const [dispensing, setDispensing] = useState<number | null>(null)

  // ── Load ────────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: dev } = await supabase
        .from("devices")
        .select("id, label, is_online, last_seen_at, firmware")
        .eq("owner_id", user.id)
        .limit(1)
        .maybeSingle()

    if (!dev) { setLoading(false); return }
    setDevice(dev)

    const [{ data: comps }, { data: evts }, { data: cmds }] = await Promise.all([
      supabase.from("compartments").select("*").eq("device_id", dev.id).order("slot"),
      supabase.from("dispense_events")
          .select("id, slot, status, triggered_by, dispensed_at, compartments(medication_name)")
          .eq("device_id", dev.id)
          .order("dispensed_at", { ascending: false })
          .limit(30),
      supabase.from("dispense_commands")
          .select("id, slot, status, created_at, executed_at")
          .eq("device_id", dev.id)
          .order("created_at", { ascending: false })
          .limit(10),
    ])

    setCompartments((comps ?? []) as Compartment[])
    setEvents((evts as unknown as DispenseEvent[]) ?? [])
    setPendingCommands((cmds ?? []) as DispenseCommand[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  // ── Real-time: device status + new dispense events ──────────────────────────

  useEffect(() => {
    if (!device) return

    const ch1 = supabase
        .channel("dispenser-device")
        .on("postgres_changes", {
          event: "UPDATE", schema: "public", table: "devices",
          filter: `id=eq.${device.id}`,
        }, (p) => setDevice(prev => prev ? { ...prev, ...(p.new as Device) } : prev))
        .subscribe()

    const ch2 = supabase
        .channel("dispenser-events")
        .on("postgres_changes", {
          event: "INSERT", schema: "public", table: "dispense_events",
          filter: `device_id=eq.${device.id}`,
        }, () => load())
        .subscribe()

    const ch3 = supabase
        .channel("dispenser-commands")
        .on("postgres_changes", {
          event: "UPDATE", schema: "public", table: "dispense_commands",
          filter: `device_id=eq.${device.id}`,
        }, () => load())
        .subscribe()

    return () => {
      supabase.removeChannel(ch1)
      supabase.removeChannel(ch2)
      supabase.removeChannel(ch3)
    }
  }, [device?.id, supabase, load])

  // ── Manual dispense ─────────────────────────────────────────────────────────
  // Inserts a command row. The ESP32 polls /api/device/commands and acts on it.
  // RFID is required on the device before the motor fires.

  const sendManualDispense = async (slot: number) => {
    if (!device) return
    setDispensing(slot)
    const { error } = await supabase.from("dispense_commands").insert({
      device_id: device.id,
      slot,
      status: "pending",
      demo: false,
    })
    if (error) toast.error(error.message)
    else toast.success(`Dispense command sent for slot ${slot}. Scan RFID on the device.`)
    setDispensing(null)
    load()
  }

  // ── Demo dispense ────────────────────────────────────────────────────────────
  // Same as manual but sets demo: true — ESP32 skips RFID check.

  const sendDemoDispense = async () => {
    if (!device) return
    setSendingDemo(true)
    const { error } = await supabase.from("dispense_commands").insert({
      device_id: device.id,
      slot: demoSlot,      // 0 = all slots
      status: "pending",
      demo: true,
    })
    setSendingDemo(false)
    setShowDemo(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(
          demoSlot === 0
              ? "Demo: all 3 motors will spin (no RFID needed)"
              : `Demo: slot ${demoSlot} motor will spin (no RFID needed)`,
          { duration: 5000 }
      )
      load()
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dispenser</h1>
            <p className="text-muted-foreground">
              Live device status, compartment control, and dispense history.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />
              Refresh
            </Button>
            {device && (
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowDemo(true)}
                    className="gap-2"
                >
                  <Zap className="size-4" />
                  Demo Dispense
                </Button>
            )}
          </div>
        </div>

        {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        ) : !device ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <HardDrive className="size-12 text-muted-foreground/40" />
                <div>
                  <p className="font-semibold">No device linked</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <Link href="/devices" className="underline">Register your ESP32 →</Link>
                  </p>
                </div>
              </CardContent>
            </Card>
        ) : (
            <>
              {/* Device status banner */}
              <Card className={cn(
                  "border-2",
                  device.is_online ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
              )}>
                <CardContent className="flex flex-wrap items-center gap-4 py-4">
                  <div className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-xl",
                      device.is_online ? "bg-green-100" : "bg-red-100"
                  )}>
                    {device.is_online
                        ? <Wifi className="size-6 text-green-600" />
                        : <WifiOff className="size-6 text-red-600" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-lg">{device.label ?? device.id}</h2>
                      <Badge className={device.is_online ? "bg-green-500" : "bg-red-500"}>
                        {device.is_online ? "Online" : "Offline"}
                      </Badge>
                      {device.firmware && <Badge variant="outline">{device.firmware}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last seen: {relativeTime(device.last_seen_at)}
                    </p>
                  </div>
                  {!device.is_online && (
                      <p className="text-sm text-red-700 max-w-xs">
                        Device is offline. Commands will queue and execute when it reconnects.
                      </p>
                  )}
                </CardContent>
              </Card>

              {/* 3 Compartment cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map(slot => {
                  const c = compartments.find(x => x.slot === slot)
                  const pct = c && c.capacity > 0 ? (c.pill_count / c.capacity) * 100 : 0
                  const low = c && c.medication_name && c.pill_count / c.capacity < 0.2

                  return (
                      <Card key={slot} className={cn(
                          "border-2",
                          c?.medication_name ? SLOT_COLORS[slot] : "border-dashed bg-muted/20"
                      )}>
                        <CardContent className="flex flex-col gap-3 p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                  "flex size-7 items-center justify-center rounded-full text-xs font-bold text-white",
                                  slot === 1 ? "bg-blue-500" : slot === 2 ? "bg-violet-500" : "bg-emerald-500"
                              )}>
                                {slot}
                              </div>
                              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Compartment {slot}
                        </span>
                            </div>
                            {low && <Badge className="bg-amber-100 text-amber-700 text-xs">Low</Badge>}
                          </div>

                          {c?.medication_name ? (
                              <>
                                <div>
                                  <p className="font-semibold">{c.medication_name}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {c.pill_count} / {c.capacity} pills
                                  </p>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                  <div
                                      className={cn(
                                          "h-full rounded-full transition-all",
                                          low ? "bg-amber-500" : "bg-green-500"
                                      )}
                                      style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </>
                          ) : (
                              <p className="text-sm italic text-muted-foreground py-2">
                                No medication set.{" "}
                                <Link href="/medications" className="underline">Configure →</Link>
                              </p>
                          )}

                          <Button
                              size="sm"
                              className="w-full"
                              disabled={!c?.medication_name || dispensing === slot}
                              onClick={() => sendManualDispense(slot)}
                          >
                            {dispensing === slot
                                ? <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                                : <Play className="mr-1.5 size-3.5" />
                            }
                            {dispensing === slot ? "Sending…" : "Dispense (RFID required)"}
                          </Button>
                        </CardContent>
                      </Card>
                  )
                })}
              </div>

              {/* Pending commands */}
              {pendingCommands.filter(c => c.status === "pending").length > 0 && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="flex items-start gap-3 py-4">
                      <Clock className="mt-0.5 size-4 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-medium text-amber-900">Pending commands</p>
                        <p className="text-sm text-amber-800 mt-0.5">
                          {pendingCommands.filter(c => c.status === "pending").length} command(s) waiting for the ESP32.
                          {!device.is_online && " The device is offline — they'll execute on reconnect."}
                          {device.is_online && " The device is online — RFID scan required to execute."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
              )}

              {/* Dispense history */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="size-5" />
                    Dispense History
                  </CardTitle>
                  <CardDescription>
                    Logged by the ESP32 after every motor action (scheduled, manual, or demo).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {events.length === 0 ? (
                      <p className="py-8 text-center text-sm text-muted-foreground">No events yet.</p>
                  ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Slot</TableHead>
                            <TableHead>Medication</TableHead>
                            <TableHead>Trigger</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {events.map(e => (
                              <TableRow key={e.id}>
                                <TableCell className="text-sm text-muted-foreground">
                                  {relativeTime(e.dispensed_at)}
                                </TableCell>
                                <TableCell>
                                  {e.slot != null ? (
                                      <span className={cn(
                                          "inline-flex size-6 items-center justify-center rounded-full text-xs font-bold text-white",
                                          e.slot === 1 ? "bg-blue-500" : e.slot === 2 ? "bg-violet-500" : "bg-emerald-500"
                                      )}>
                              {e.slot}
                            </span>
                                  ) : "—"}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {e.compartments?.medication_name ?? "—"}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize text-xs">
                                    {e.triggered_by}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {e.status === "success" && (
                                      <Badge className="bg-green-100 text-green-700 gap-1 text-xs">
                                        <CheckCircle className="size-3" /> Success
                                      </Badge>
                                  )}
                                  {e.status === "missed" && (
                                      <Badge className="bg-amber-100 text-amber-700 gap-1 text-xs">
                                        <Clock className="size-3" /> Missed
                                      </Badge>
                                  )}
                                  {e.status === "jammed" && (
                                      <Badge variant="destructive" className="gap-1 text-xs">
                                        <XCircle className="size-3" /> Jammed
                                      </Badge>
                                  )}
                                  {e.status === "manual" && (
                                      <Badge className="bg-blue-100 text-blue-700 gap-1 text-xs">
                                        <Play className="size-3" /> Manual
                                      </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                  )}
                </CardContent>
              </Card>
            </>
        )}

        {/* ── Demo Dispense Dialog ──────────────────────────────────────────────── */}
        <Dialog open={showDemo} onOpenChange={setShowDemo}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="size-5 text-amber-500" />
                Demo Dispense
              </DialogTitle>
              <DialogDescription>
                Triggers the motor(s) immediately — <strong>no RFID card required</strong>.
                Use this to verify your hardware is wired correctly.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 space-y-3">
              <p className="text-sm font-medium">Which slot?</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 0, label: "All 3 Slots" },
                  { value: 1, label: "Slot 1 only" },
                  { value: 2, label: "Slot 2 only" },
                  { value: 3, label: "Slot 3 only" },
                ] as const).map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setDemoSlot(opt.value)}
                        className={cn(
                            "rounded-lg border px-4 py-3 text-sm font-medium transition-colors text-left",
                            demoSlot === opt.value
                                ? "border-foreground bg-foreground text-background"
                                : "border-border hover:bg-muted"
                        )}
                    >
                      {opt.label}
                    </button>
                ))}
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
                Make sure the physical compartments are ready — the motor(s) will spin immediately.
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowDemo(false)}>Cancel</Button>
              <Button onClick={sendDemoDispense} disabled={sendingDemo}>
                {sendingDemo
                    ? <Loader2 className="mr-2 size-4 animate-spin" />
                    : <Zap className="mr-2 size-4" />
                }
                {sendingDemo ? "Sending…" : "Run Demo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}