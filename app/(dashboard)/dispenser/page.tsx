"use client"

import { useEffect, useState, useCallback } from "react"
import { HardDrive, Pill, Clock, CheckCircle, XCircle, Play, AlertTriangle, RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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
  note: string | null
  compartments: { medication_name: string | null } | null
}

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
  1: "bg-blue-100 border-blue-300",
  2: "bg-violet-100 border-violet-300",
  3: "bg-emerald-100 border-emerald-300",
}

export default function DispenserPage() {
  const supabase = createClient()

  const [device, setDevice] = useState<Device | null>(null)
  const [compartments, setCompartments] = useState<Compartment[]>([])
  const [events, setEvents] = useState<DispenseEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dispensing, setDispensing] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: deviceData } = await supabase
        .from("devices")
        .select("id, label, is_online, last_seen_at, firmware")
        .eq("owner_id", user.id).limit(1).single()

    if (!deviceData) { setLoading(false); return }
    setDevice(deviceData)

    const [{ data: comps }, { data: evts }] = await Promise.all([
      supabase.from("compartments").select("*").eq("device_id", deviceData.id).order("slot"),
      supabase.from("dispense_events")
          .select("id, slot, status, triggered_by, dispensed_at, note, compartments(medication_name)")
          .eq("device_id", deviceData.id)
          .order("dispensed_at", { ascending: false })
          .limit(20),
    ])

    setCompartments(comps ?? [])
    setEvents((evts as unknown as DispenseEvent[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const manualDispense = async (slot: number) => {
    if (!device) return
    setDispensing(slot)
    const { error } = await supabase.from("dispense_commands").insert({
      device_id: device.id,
      slot,
      status: "pending",
    })
    if (error) toast.error(error.message)
    else toast.success(`Manual dispense queued for slot ${slot}`)
    setDispensing(null)
  }

  return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dispenser</h1>
            <p className="text-muted-foreground">Hardware status and dispense history.</p>
          </div>
          <Button variant="outline" onClick={load}>
            <RefreshCw className="mr-2 size-4" /> Refresh
          </Button>
        </div>

        {loading ? (
            <p className="text-muted-foreground">Loading…</p>
        ) : !device ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">No device linked to your account.</CardContent>
            </Card>
        ) : (
            <>
              {/* Device header */}
              <Card className={cn("border-2", device.is_online ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50")}>
                <CardContent className="flex flex-wrap items-center gap-4 py-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-white/70 shadow-sm">
                    <HardDrive className="size-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">{device.label ?? device.id}</h2>
                      <Badge className={device.is_online ? "bg-green-500" : "bg-red-500"}>
                        {device.is_online ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Firmware: {device.firmware ?? "Unknown"} · Last seen: {relativeTime(device.last_seen_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 3-compartment visual */}
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(slot => {
                  const c = compartments.find(x => x.slot === slot)
                  const pct = c ? Math.round((c.pill_count / c.capacity) * 100) : 0
                  return (
                      <Card key={slot} className={cn("border-2", c?.medication_name ? SLOT_COLORS[slot] : "border-dashed bg-muted/20")}>
                        <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
                          <div className="flex size-10 items-center justify-center rounded-full bg-white/70 font-bold shadow-sm">
                            {slot}
                          </div>
                          <div>
                            <p className="font-semibold">{c?.medication_name ?? <span className="italic text-muted-foreground">Empty</span>}</p>
                            {c?.medication_name && (
                                <p className="text-sm text-muted-foreground">{c.pill_count} / {c.capacity} pills ({pct}%)</p>
                            )}
                          </div>
                          <Button
                              size="sm"
                              disabled={!c?.medication_name || dispensing === slot || !device.is_online}
                              onClick={() => manualDispense(slot)}
                          >
                            <Play className="mr-1.5 size-3.5" />
                            {dispensing === slot ? "Sending…" : "Manual Dispense"}
                          </Button>
                        </CardContent>
                      </Card>
                  )
                })}
              </div>

              {!device.is_online && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="flex items-center gap-3 py-3">
                      <AlertTriangle className="size-4 text-amber-600" />
                      <p className="text-sm text-amber-800">
                        Device is offline. Commands will be queued and executed when it reconnects.
                      </p>
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
                  <CardDescription>Logged by the ESP32 for every dispense attempt.</CardDescription>
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
                                <TableCell className="text-muted-foreground text-sm">
                                  {new Date(e.dispensed_at).toLocaleString()}
                                </TableCell>
                                <TableCell>{e.slot ?? "—"}</TableCell>
                                <TableCell className="font-medium">
                                  {e.compartments?.medication_name ?? "—"}
                                </TableCell>
                                <TableCell className="capitalize text-muted-foreground text-sm">
                                  {e.triggered_by}
                                </TableCell>
                                <TableCell>
                                  {e.status === "success" && (
                                      <Badge className="bg-green-100 text-green-700 gap-1">
                                        <CheckCircle className="size-3" /> Success
                                      </Badge>
                                  )}
                                  {e.status === "missed" && (
                                      <Badge className="bg-amber-100 text-amber-700 gap-1">
                                        <Clock className="size-3" /> Missed
                                      </Badge>
                                  )}
                                  {e.status === "jammed" && (
                                      <Badge variant="destructive" className="gap-1">
                                        <XCircle className="size-3" /> Jammed
                                      </Badge>
                                  )}
                                  {e.status === "manual" && (
                                      <Badge className="bg-blue-100 text-blue-700 gap-1">
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
      </div>
  )
}