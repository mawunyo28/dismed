"use client"

import { useEffect, useState, useCallback } from "react"
import { Clock, Plus, Trash2, Save, X, CheckCircle, AlertTriangle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Compartment {
  id: string
  slot: number
  medication_name: string | null
  dosage_mg: number | null
}

interface Schedule {
  id: string
  compartment_id: string
  dispense_time: string
  days_of_week: number[]
  pills_per_dose: number
  active: boolean
  compartments: Compartment
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function fmt12(time: string) {
  const [h, m] = time.split(":").map(Number)
  const suffix = h >= 12 ? "PM" : "AM"
  const h12 = ((h % 12) || 12).toString().padStart(2, "0")
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`
}

const SLOT_COLORS: Record<number, string> = {
  1: "bg-blue-100 text-blue-800 border-blue-300",
  2: "bg-violet-100 text-violet-800 border-violet-300",
  3: "bg-emerald-100 text-emerald-800 border-emerald-300",
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SchedulesPage() {
  const supabase = createClient()

  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [compartments, setCompartments] = useState<Compartment[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const [form, setForm] = useState({
    compartment_id: "",
    dispense_time: "08:00",
    days_of_week: [1, 2, 3, 4, 5] as number[],
    pills_per_dose: "1",
  })

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: deviceData } = await supabase
        .from("devices").select("id").eq("owner_id", user.id).limit(1).single()
    if (!deviceData) { setLoading(false); return }
    setDeviceId(deviceData.id)

    const [{ data: comps }, { data: scheds }] = await Promise.all([
      supabase.from("compartments").select("id, slot, medication_name, dosage_mg")
          .eq("device_id", deviceData.id).order("slot"),
      supabase.from("schedules")
          .select("*, compartments(id, slot, medication_name, dosage_mg)")
          .eq("device_id", deviceData.id)
          .order("dispense_time"),
    ])

    setCompartments(comps ?? [])
    setSchedules((scheds as unknown as Schedule[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  // ── Toggle schedule active ─────────────────────────────────────────────────

  const toggleActive = async (sched: Schedule) => {
    const { error } = await supabase
        .from("schedules").update({ active: !sched.active }).eq("id", sched.id)
    if (error) toast.error(error.message)
    else load()
  }

  // ── Delete schedule ────────────────────────────────────────────────────────

  const deleteSchedule = async (id: string) => {
    const { error } = await supabase.from("schedules").delete().eq("id", id)
    if (error) toast.error(error.message)
    else { toast.success("Schedule removed"); load() }
  }

  // ── Add schedule ───────────────────────────────────────────────────────────

  const addSchedule = async () => {
    if (!deviceId || !form.compartment_id) {
      toast.error("Please select a compartment")
      return
    }
    if (form.days_of_week.length === 0) {
      toast.error("Select at least one day")
      return
    }
    const { error } = await supabase.from("schedules").insert({
      device_id: deviceId,
      compartment_id: form.compartment_id,
      dispense_time: form.dispense_time,
      days_of_week: form.days_of_week,
      pills_per_dose: parseInt(form.pills_per_dose) || 1,
      active: true,
    })
    if (error) toast.error(error.message)
    else {
      toast.success("Schedule added")
      setShowAdd(false)
      setForm({ compartment_id: "", dispense_time: "08:00", days_of_week: [1,2,3,4,5], pills_per_dose: "1" })
      load()
    }
  }

  const toggleDay = (dow: number) =>
      setForm(f => ({
        ...f,
        days_of_week: f.days_of_week.includes(dow)
            ? f.days_of_week.filter(d => d !== dow)
            : [...f.days_of_week, dow].sort(),
      }))

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Schedules</h1>
            <p className="text-muted-foreground">
              Define when each compartment should dispense. The ESP32 reads these and acts accordingly.
            </p>
          </div>
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="mr-2 size-4" />
            Add Schedule
          </Button>
        </div>

        {loading ? (
            <p className="text-muted-foreground">Loading…</p>
        ) : schedules.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <Clock className="size-10 text-muted-foreground" />
                <p className="font-medium">No schedules yet</p>
                <p className="text-sm text-muted-foreground">Add a schedule to start automated dispensing.</p>
                <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 size-4" />Add Schedule</Button>
              </CardContent>
            </Card>
        ) : (
            <div className="flex flex-col gap-3">
              {schedules.map(s => {
                const slot = s.compartments?.slot ?? 0
                return (
                    <Card key={s.id} className={cn(!s.active && "opacity-60")}>
                      <CardContent className="flex items-center gap-4 py-4">
                        <div className="w-24 shrink-0 text-center">
                          <p className="text-xl font-bold tabular-nums">{fmt12(s.dispense_time)}</p>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={cn("border text-xs", SLOT_COLORS[slot])}>
                              Slot {slot}
                            </Badge>
                            <p className="font-medium">{s.compartments?.medication_name ?? "Unknown"}</p>
                            {s.compartments?.dosage_mg && (
                                <span className="text-sm text-muted-foreground">{s.compartments.dosage_mg} mg</span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {DAY_LABELS.map((label, i) => (
                                <span
                                    key={i}
                                    className={cn(
                                        "inline-flex size-6 items-center justify-center rounded-full text-[10px] font-medium",
                                        s.days_of_week.includes(i)
                                            ? "bg-foreground text-background"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                          {label[0]}
                        </span>
                            ))}
                            <span className="ml-2 text-xs text-muted-foreground self-center">
                        · {s.pills_per_dose} pill{s.pills_per_dose !== 1 ? "s" : ""}
                      </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <Switch
                              checked={s.active}
                              onCheckedChange={() => toggleActive(s)}
                          />
                          <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteSchedule(s.id)}
                          >
                            <Trash2 className="size-4 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                )
              })}
            </div>
        )}

        {/* Note about ESP32 syncing */}
        <Card className="bg-muted/40 border-dashed">
          <CardContent className="flex items-start gap-3 py-4">
            <CheckCircle className="size-4 mt-0.5 text-green-600 shrink-0" />
            <p className="text-sm text-muted-foreground">
              The ESP32 fetches this schedule via <code className="bg-muted px-1 rounded text-xs">GET /api/device/schedule</code> on
              startup and every 5 minutes. Changes here take effect on the next sync.
            </p>
          </CardContent>
        </Card>

        {/* Add schedule dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Dispense Schedule</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2">
              {/* Compartment */}
              <div className="grid gap-1.5">
                <Label>Compartment</Label>
                <Select value={form.compartment_id} onValueChange={v => setForm(f => ({ ...f, compartment_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a compartment" />
                  </SelectTrigger>
                  <SelectContent>
                    {compartments.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          Slot {c.slot} — {c.medication_name ?? "Empty"}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {compartments.every(c => !c.medication_name) && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="size-3" />
                      Set up medications first from the Medications page.
                    </p>
                )}
              </div>

              {/* Time */}
              <div className="grid gap-1.5">
                <Label htmlFor="dispense-time">Dispense Time</Label>
                <Input
                    id="dispense-time"
                    type="time"
                    value={form.dispense_time}
                    onChange={e => setForm(f => ({ ...f, dispense_time: e.target.value }))}
                />
              </div>

              {/* Days */}
              <div className="grid gap-1.5">
                <Label>Days of Week</Label>
                <div className="flex gap-2">
                  {DAY_LABELS.map((label, i) => (
                      <button
                          key={i}
                          type="button"
                          onClick={() => toggleDay(i)}
                          className={cn(
                              "flex size-9 items-center justify-center rounded-full text-sm font-medium transition-colors",
                              form.days_of_week.includes(i)
                                  ? "bg-foreground text-background"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                      >
                        {label[0]}
                      </button>
                  ))}
                </div>
              </div>

              {/* Pills per dose */}
              <div className="grid gap-1.5">
                <Label htmlFor="pills">Pills per Dose</Label>
                <Input
                    id="pills"
                    type="number"
                    min={1}
                    max={5}
                    value={form.pills_per_dose}
                    onChange={e => setForm(f => ({ ...f, pills_per_dose: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowAdd(false)}>
                <X className="mr-2 size-4" />Cancel
              </Button>
              <Button onClick={addSchedule}>
                <Save className="mr-2 size-4" />Save Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}