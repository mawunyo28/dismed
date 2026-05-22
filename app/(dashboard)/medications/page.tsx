"use client"

import { useEffect, useState, useCallback } from "react"
import { Pill, AlertTriangle, Clock, Grid3X3, Plus, Pencil, Trash2, Save, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Compartment {
  id: string
  slot: number                // 1 | 2 | 3
  medication_name: string | null
  dosage_mg: number | null
  pill_count: number
  capacity: number
  updated_at: string
}

interface Device {
  id: string
  label: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stockStatus(c: Compartment): "active" | "low" | "empty" {
  if (c.pill_count === 0) return "empty"
  if (c.pill_count / c.capacity < 0.2) return "low"
  return "active"
}

const SLOT_COLORS: Record<number, string> = {
  1: "bg-blue-100 border-blue-300 text-blue-800",
  2: "bg-violet-100 border-violet-300 text-violet-800",
  3: "bg-emerald-100 border-emerald-300 text-emerald-800",
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MedicationsPage() {
  const supabase = createClient()

  const [device, setDevice] = useState<Device | null>(null)
  const [compartments, setCompartments] = useState<Compartment[]>([])
  const [loading, setLoading] = useState(true)

  // Edit dialog state
  const [editing, setEditing] = useState<Compartment | null>(null)
  const [form, setForm] = useState({
    medication_name: "",
    dosage_mg: "",
    pill_count: "",
    capacity: "",
  })

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // Get user's device
    const { data: deviceData } = await supabase
        .from("devices")
        .select("id, label")
        .eq("owner_id", user.id)
        .limit(1)
        .single()

    if (!deviceData) { setLoading(false); return }
    setDevice(deviceData)

    // Get its 3 compartments
    const { data: comps } = await supabase
        .from("compartments")
        .select("*")
        .eq("device_id", deviceData.id)
        .order("slot")

    setCompartments(comps ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  // ── Save compartment ───────────────────────────────────────────────────────

  const openEdit = (c: Compartment) => {
    setEditing(c)
    setForm({
      medication_name: c.medication_name ?? "",
      dosage_mg: c.dosage_mg?.toString() ?? "",
      pill_count: c.pill_count.toString(),
      capacity: c.capacity.toString(),
    })
  }

  const saveEdit = async () => {
    if (!editing) return
    const patch = {
      medication_name: form.medication_name || null,
      dosage_mg: form.dosage_mg ? parseFloat(form.dosage_mg) : null,
      pill_count: parseInt(form.pill_count) || 0,
      capacity: parseInt(form.capacity) || 30,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase
        .from("compartments")
        .update(patch)
        .eq("id", editing.id)

    if (error) {
      toast.error("Failed to save: " + error.message)
    } else {
      toast.success(`Compartment ${editing.slot} updated`)
      setEditing(null)
      load()
    }
  }

  const clearCompartment = async (c: Compartment) => {
    const { error } = await supabase
        .from("compartments")
        .update({ medication_name: null, dosage_mg: null, pill_count: 0, updated_at: new Date().toISOString() })
        .eq("id", c.id)
    if (error) toast.error(error.message)
    else { toast.success(`Compartment ${c.slot} cleared`); load() }
  }

  // ── Derived stats ──────────────────────────────────────────────────────────

  const active = compartments.filter(c => c.medication_name && stockStatus(c) === "active").length
  const low    = compartments.filter(c => stockStatus(c) === "low").length
  const empty  = compartments.filter(c => !c.medication_name).length

  // ── Render ────────────────────────────────────────────────────────────────

  return (
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Medications & Compartments</h1>
            <p className="text-muted-foreground">
              {device ? `Device: ${device.label ?? device.id}` : "No device linked yet"} · 3 compartments
            </p>
          </div>
        </div>

        {/* Visual compartment map */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(slot => {
            const c = compartments.find(x => x.slot === slot)
            const filled = !!c?.medication_name
            const pct = c ? (c.pill_count / c.capacity) * 100 : 0
            return (
                <Card
                    key={slot}
                    className={cn(
                        "border-2 transition-colors cursor-pointer hover:shadow-md",
                        filled ? SLOT_COLORS[slot] : "border-dashed border-muted-foreground/30 bg-muted/30"
                    )}
                    onClick={() => c && openEdit(c)}
                >
                  <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-white/70 shadow-sm">
                      <Pill className="size-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Compartment {slot}
                      </p>
                      <p className="mt-0.5 font-semibold">
                        {c?.medication_name ?? <span className="text-muted-foreground italic">Empty — click to set up</span>}
                      </p>
                      {c?.dosage_mg && (
                          <p className="text-xs text-muted-foreground">{c.dosage_mg} mg</p>
                      )}
                    </div>
                    {filled && c && (
                        <div className="w-full">
                          <Progress value={pct} className="h-2" />
                          <p className="mt-1 text-xs text-muted-foreground">{c.pill_count} / {c.capacity} pills</p>
                        </div>
                    )}
                    {!filled && (
                        <div className="flex size-8 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40">
                          <Plus className="size-4 text-muted-foreground/40" />
                        </div>
                    )}
                  </CardContent>
                </Card>
            )
          })}
        </div>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <Pill className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{active}</p>
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
                <p className="text-2xl font-bold">{low}</p>
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
                <p className="text-2xl font-bold">{empty}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail table */}
        <Card>
          <CardHeader>
            <CardTitle>Compartment Details</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
                <p className="py-8 text-center text-muted-foreground">Loading…</p>
            ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Slot</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Pill Count / Capacity</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compartments.map(c => {
                      const pct = (c.pill_count / c.capacity) * 100
                      const status = stockStatus(c)
                      return (
                          <TableRow key={c.id}>
                            <TableCell>
                              <Badge className={cn("border", SLOT_COLORS[c.slot])}>
                                Slot {c.slot}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {c.medication_name ?? <span className="italic text-muted-foreground">Not set</span>}
                            </TableCell>
                            <TableCell>{c.dosage_mg ? `${c.dosage_mg} mg` : "—"}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                          <span className="text-sm">
                            <strong>{c.pill_count}</strong> / {c.capacity}
                          </span>
                                <Progress
                                    value={pct}
                                    className={cn(
                                        "h-2 w-28",
                                        status === "low" && "[&>div]:bg-amber-500",
                                        status === "empty" && "[&>div]:bg-red-500"
                                    )}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              {status === "active" && <Badge className="bg-green-100 text-green-700">Active</Badge>}
                              {status === "low"    && <Badge className="bg-amber-100 text-amber-700">Low Stock</Badge>}
                              {status === "empty"  && <Badge variant="secondary">Empty</Badge>}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                                  <Pencil className="size-4" />
                                </Button>
                                {c.medication_name && (
                                    <Button variant="ghost" size="icon" onClick={() => clearCompartment(c)}>
                                      <Trash2 className="size-4 text-red-500" />
                                    </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit dialog */}
        <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing?.medication_name ? "Edit" : "Set up"} Compartment {editing?.slot}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="med-name">Medication Name</Label>
                <Input
                    id="med-name"
                    placeholder="e.g. Metformin"
                    value={form.medication_name}
                    onChange={e => setForm(f => ({ ...f, medication_name: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
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
                <div className="grid gap-1.5">
                  <Label htmlFor="pill-count">Current Pill Count</Label>
                  <Input
                      id="pill-count"
                      type="number"
                      placeholder="e.g. 28"
                      value={form.pill_count}
                      onChange={e => setForm(f => ({ ...f, pill_count: e.target.value }))}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="capacity">Compartment Capacity</Label>
                  <Input
                      id="capacity"
                      type="number"
                      placeholder="e.g. 30"
                      value={form.capacity}
                      onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                  />
                </div>
              </div>

              {editing && (
                  <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    This updates the portal. When the ESP32 successfully dispenses, it will automatically
                    decrement the pill count via <code>/api/device/dispense</code>.
                  </p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                <X className="mr-2 size-4" /> Cancel
              </Button>
              <Button onClick={saveEdit}>
                <Save className="mr-2 size-4" /> Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}