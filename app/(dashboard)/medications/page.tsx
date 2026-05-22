"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Pill, AlertTriangle, Grid3X3, Pencil, Save, X,
  RefreshCw, Loader2, CheckCircle, Plus, Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Compartment {
  id: string
  device_id: string
  slot: number
  medication_name: string | null
  dosage_mg: number | null
  pill_count: number
  capacity: number
  updated_at: string
}

interface FormState {
  medication_name: string
  dosage_mg: string
  pill_count: string
  capacity: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type StockLevel = "ok" | "low" | "empty"

function stockLevel(c: Compartment): StockLevel {
  if (!c.medication_name) return "empty"
  if (c.pill_count === 0) return "empty"
  if (c.pill_count / c.capacity < 0.2) return "low"
  return "ok"
}

const SLOT_ACCENT: Record<number, { bg: string; border: string; dot: string }> = {
  1: { bg: "bg-blue-50",   border: "border-blue-200",   dot: "bg-blue-500"   },
  2: { bg: "bg-violet-50", border: "border-violet-200", dot: "bg-violet-500" },
  3: { bg: "bg-emerald-50",border: "border-emerald-200",dot: "bg-emerald-500"},
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(iso).toLocaleDateString()
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MedicationsPage() {
  const supabase = useMemo(() => createClient(), [])

  const [compartments, setCompartments] = useState<Compartment[]>([])
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Edit dialog
  const [editing, setEditing] = useState<Compartment | null>(null)
  const [form, setForm] = useState<FormState>({ medication_name: "", dosage_mg: "", pill_count: "", capacity: "" })
  const [saving, setSaving] = useState(false)

  // ── Load ────────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: device } = await supabase
        .from("devices")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1)
        .maybeSingle()

    if (!device) { setLoading(false); return }
    setDeviceId(device.id)

    const { data, error } = await supabase
        .from("compartments")
        .select("*")
        .eq("device_id", device.id)
        .order("slot")

    if (error) toast.error(error.message)
    else setCompartments((data ?? []) as Compartment[])

    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  // ── Real-time: pill count changes from dispense events ────────────────────

  useEffect(() => {
    if (!deviceId) return
    const channel = supabase
        .channel("compartments-live")
        .on("postgres_changes", {
          event: "UPDATE", schema: "public", table: "compartments",
          filter: `device_id=eq.${deviceId}`,
        }, (payload) => {
          const updated = payload.new as Compartment
          setCompartments(prev =>
              prev.map(c => c.id === updated.id ? updated : c)
          )
        })
        .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [deviceId, supabase])

  // ── Edit dialog ─────────────────────────────────────────────────────────────

  const openEdit = (c: Compartment) => {
    setEditing(c)
    setForm({
      medication_name: c.medication_name ?? "",
      dosage_mg:       c.dosage_mg?.toString() ?? "",
      pill_count:      c.pill_count.toString(),
      capacity:        c.capacity.toString(),
    })
  }

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)

    const patch = {
      medication_name: form.medication_name.trim() || null,
      dosage_mg:       form.dosage_mg ? parseFloat(form.dosage_mg) : null,
      pill_count:      Math.max(0, parseInt(form.pill_count) || 0),
      capacity:        Math.max(1, parseInt(form.capacity)   || 30),
      updated_at:      new Date().toISOString(),
    }

    // Clamp pill_count to capacity
    if (patch.pill_count > patch.capacity) patch.pill_count = patch.capacity

    const { error } = await supabase
        .from("compartments")
        .update(patch)
        .eq("id", editing.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`Compartment ${editing.slot} saved`)
      setEditing(null)
      load()
    }
    setSaving(false)
  }

  const clearCompartment = async (c: Compartment) => {
    if (!confirm(`Clear compartment ${c.slot}? This removes the medication and resets the pill count.`)) return
    const { error } = await supabase
        .from("compartments")
        .update({ medication_name: null, dosage_mg: null, pill_count: 0, updated_at: new Date().toISOString() })
        .eq("id", c.id)
    if (error) toast.error(error.message)
    else { toast.success(`Compartment ${c.slot} cleared`); load() }
  }

  // ── Stats ───────────────────────────────────────────────────────────────────

  const filled     = compartments.filter(c => c.medication_name)
  const lowStock   = compartments.filter(c => stockLevel(c) === "low")
  const emptySlots = compartments.filter(c => !c.medication_name)

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Medications</h1>
            <p className="text-muted-foreground">
              Assign medications to the 3 compartments and track pill counts.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <Pill className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Filled Slots</p>
                <p className="text-2xl font-bold">{filled.length} / 3</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100">
                <AlertTriangle className="size-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowStock.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <Grid3X3 className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Empty Slots</p>
                <p className="text-2xl font-bold">{emptySlots.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        ) : compartments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-14 text-center text-muted-foreground">
                No device linked. <a href="/devices" className="underline">Register your dispenser first →</a>
              </CardContent>
            </Card>
        ) : (
            <>
              {/* Visual compartment cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map(slot => {
                  const c = compartments.find(x => x.slot === slot)
                  if (!c) return null
                  const level = stockLevel(c)
                  const pct = c.capacity > 0 ? (c.pill_count / c.capacity) * 100 : 0
                  const accent = SLOT_ACCENT[slot]

                  return (
                      <Card
                          key={slot}
                          className={cn(
                              "border-2 cursor-pointer hover:shadow-md transition-all group",
                              c.medication_name
                                  ? `${accent.bg} ${accent.border}`
                                  : "border-dashed bg-muted/20 hover:bg-muted/30"
                          )}
                          onClick={() => openEdit(c)}
                      >
                        <CardContent className="flex flex-col gap-3 p-5">
                          {/* Slot number */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={cn("size-2.5 rounded-full", c.medication_name ? accent.dot : "bg-muted-foreground/30")} />
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Compartment {slot}
                        </span>
                            </div>
                            <Pencil className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>

                          {/* Medication info */}
                          {c.medication_name ? (
                              <>
                                <div>
                                  <p className="font-semibold text-lg leading-tight">{c.medication_name}</p>
                                  {c.dosage_mg && (
                                      <p className="text-sm text-muted-foreground">{c.dosage_mg} mg per dose</p>
                                  )}
                                </div>

                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {c.pill_count} / {c.capacity} pills
                            </span>
                                    {level === "low" && (
                                        <Badge className="bg-amber-100 text-amber-700 text-xs">Low</Badge>
                                    )}
                                    {level === "empty" && (
                                        <Badge variant="destructive" className="text-xs">Empty</Badge>
                                    )}
                                    {level === "ok" && (
                                        <Badge className="bg-green-100 text-green-700 text-xs">OK</Badge>
                                    )}
                                  </div>
                                  <Progress
                                      value={pct}
                                      className={cn(
                                          "h-2",
                                          level === "low"   && "[&>div]:bg-amber-500",
                                          level === "empty" && "[&>div]:bg-red-500",
                                          level === "ok"    && "[&>div]:bg-green-500",
                                      )}
                                  />
                                </div>

                                <p className="text-xs text-muted-foreground">
                                  Updated {relativeTime(c.updated_at)}
                                </p>
                              </>
                          ) : (
                              <div className="flex flex-col items-center gap-2 py-4 text-center">
                                <div className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30">
                                  <Plus className="size-4 text-muted-foreground/40" />
                                </div>
                                <p className="text-sm text-muted-foreground">Click to set up medication</p>
                              </div>
                          )}
                        </CardContent>
                      </Card>
                  )
                })}
              </div>

              {/* Low stock alerts */}
              {lowStock.length > 0 && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="flex items-start gap-3 py-4">
                      <AlertTriangle className="mt-0.5 size-4 text-amber-600 shrink-0" />
                      <div className="space-y-1">
                        <p className="font-medium text-amber-900">Low stock alert</p>
                        {lowStock.map(c => (
                            <p key={c.id} className="text-sm text-amber-800">
                              Slot {c.slot} · {c.medication_name}: {c.pill_count} pills remaining
                              ({Math.round((c.pill_count / c.capacity) * 100)}% full)
                            </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
              )}

              {/* Info: automatic decrement */}
              <Card className="bg-muted/40 border-dashed">
                <CardContent className="py-3">
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <CheckCircle className="size-3.5 mt-0.5 text-green-600 shrink-0" />
                    Pill counts are automatically decremented by the ESP32 each time a dose is dispensed.
                    Edit counts manually here only when physically refilling a compartment.
                  </p>
                </CardContent>
              </Card>
            </>
        )}

        {/* Edit dialog */}
        <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing?.medication_name
                    ? `Edit Compartment ${editing?.slot}`
                    : `Set Up Compartment ${editing?.slot}`}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="med-name">Medication name</Label>
                <Input
                    id="med-name"
                    placeholder="e.g. Metformin"
                    value={form.medication_name}
                    onChange={e => setForm(f => ({ ...f, medication_name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dosage">Dosage (mg)</Label>
                <Input
                    id="dosage"
                    type="number"
                    placeholder="e.g. 500"
                    value={form.dosage_mg}
                    onChange={e => setForm(f => ({ ...f, dosage_mg: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pill-count">Current pill count</Label>
                  <Input
                      id="pill-count"
                      type="number"
                      placeholder="e.g. 28"
                      value={form.pill_count}
                      onChange={e => setForm(f => ({ ...f, pill_count: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                      id="capacity"
                      type="number"
                      placeholder="e.g. 30"
                      value={form.capacity}
                      onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground rounded-lg bg-muted px-3 py-2">
                Set pill count to the number currently loaded. The ESP32 decrements this
                automatically after each dispense.
              </p>
            </div>

            <DialogFooter className="flex flex-wrap gap-2">
              {editing?.medication_name && (
                  <Button
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 mr-auto"
                      onClick={() => { setEditing(null); clearCompartment(editing!) }}
                  >
                    <Trash2 className="mr-2 size-4" /> Clear slot
                  </Button>
              )}
              <Button variant="outline" onClick={() => setEditing(null)}>
                <X className="mr-2 size-4" /> Cancel
              </Button>
              <Button onClick={saveEdit} disabled={saving}>
                {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}