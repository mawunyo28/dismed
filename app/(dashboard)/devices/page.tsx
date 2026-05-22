"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  HardDrive,
  Loader2,
  Pill,
  Plus,
  RefreshCw,
  Router,
  Settings2,
  Terminal,
  Wifi,
  WifiOff,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface Device {
  id: string
  owner_id: string
  device_key: string
  label: string | null
  firmware: string | null
  last_seen_at: string | null
  is_online: boolean | null
  created_at: string
}

interface Compartment {
  id: string
  slot: number
  medication_name: string | null
  dosage_mg: number | null
  pill_count: number
  capacity: number
  updated_at: string | null
}

interface Schedule {
  id: string
  dispense_time: string
  days_of_week: number[]
  pills_per_dose: number
  active: boolean
  compartment_id: string
  compartments: { slot: number; medication_name: string | null } | null
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

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function relativeTime(iso: string | null) {
  if (!iso) return "Never"

  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)

  if (Number.isNaN(mins)) return "Unknown"
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`

  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`

  return `${Math.floor(hrs / 24)}d ago`
}

function isDeviceOnline(device: Device | null) {
  if (!device?.last_seen_at) return false

  const lastSeen = new Date(device.last_seen_at).getTime()
  return Date.now() - lastSeen < 2 * 60 * 1000
}

function statusBadge(status: string) {
  switch (status) {
    case "success":
    case "manual":
      return <Badge className="bg-emerald-600">Success</Badge>
    case "missed":
      return <Badge className="bg-amber-500">Missed</Badge>
    case "jammed":
    case "failed":
      return <Badge variant="destructive">{status}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function formatScheduleTime(value: string) {
  const [hour, minute] = value.split(":").map(Number)
  const suffix = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12

  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`
}

export default function DevicesPage() {
  const supabase = useMemo(() => createClient(), [])

  const [userId, setUserId] = useState<string | null>(null)
  const [device, setDevice] = useState<Device | null>(null)
  const [compartments, setCompartments] = useState<Compartment[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [events, setEvents] = useState<DispenseEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deviceLabel, setDeviceLabel] = useState("ESP32 Pill Dispenser")

  const load = useCallback(async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    setUserId(user.id)

    const { data: deviceData, error: deviceError } = await supabase
      .from("devices")
      .select("id, owner_id, device_key, label, firmware, last_seen_at, is_online, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (deviceError) {
      toast.error(deviceError.message)
      setLoading(false)
      return
    }

    if (!deviceData) {
      setDevice(null)
      setCompartments([])
      setSchedules([])
      setEvents([])
      setLoading(false)
      return
    }

    setDevice(deviceData as Device)

    const [{ data: comps }, { data: scheds }, { data: evts }] = await Promise.all([
      supabase
        .from("compartments")
        .select("id, slot, medication_name, dosage_mg, pill_count, capacity, updated_at")
        .eq("device_id", deviceData.id)
        .order("slot"),
      supabase
        .from("schedules")
        .select("id, dispense_time, days_of_week, pills_per_dose, active, compartment_id, compartments(slot, medication_name)")
        .eq("device_id", deviceData.id)
        .order("dispense_time"),
      supabase
        .from("dispense_events")
        .select("id, slot, status, triggered_by, dispensed_at, note, compartments(medication_name)")
        .eq("device_id", deviceData.id)
        .order("dispensed_at", { ascending: false })
        .limit(10),
    ])

    setCompartments((comps as Compartment[]) ?? [])
    setSchedules((scheds as unknown as Schedule[]) ?? [])
    setEvents((evts as unknown as DispenseEvent[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    load()
  }, [load])

  const online = isDeviceOnline(device)
  const activeSchedules = schedules.filter((schedule) => schedule.active).length
  const totalPills = compartments.reduce((total, compartment) => total + compartment.pill_count, 0)
  const totalCapacity = compartments.reduce((total, compartment) => total + compartment.capacity, 0)
  const fillPercent = totalCapacity > 0 ? Math.round((totalPills / totalCapacity) * 100) : 0

  const createDevice = async () => {
    if (!userId) return

    setCreating(true)

    const deviceKey = `esp32_${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`
    const { data: createdDevice, error: deviceError } = await supabase
      .from("devices")
      .insert({
        owner_id: userId,
        label: deviceLabel.trim() || "ESP32 Pill Dispenser",
        device_key: deviceKey,
        firmware: "unreported",
        is_online: false,
      })
      .select("id, owner_id, device_key, label, firmware, last_seen_at, is_online, created_at")
      .single()

    if (deviceError || !createdDevice) {
      toast.error(deviceError?.message ?? "Could not create device.")
      setCreating(false)
      return
    }

    const { error: compartmentError } = await supabase.from("compartments").insert(
      [1, 2, 3].map((slot) => ({
        device_id: createdDevice.id,
        slot,
        medication_name: null,
        dosage_mg: null,
        pill_count: 0,
        capacity: 30,
      })),
    )

    if (compartmentError) toast.error(compartmentError.message)
    else toast.success("Dispenser linked. Add medications and schedules next.")

    setCreating(false)
    load()
  }

  const copyDeviceKey = async () => {
    if (!device) return

    await navigator.clipboard.writeText(device.device_key)
    toast.success("Device key copied")
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading dispenser device data from Supabase.
        </div>
      </div>
    )
  }

  if (!device) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Device Setup</h1>
          <p className="text-muted-foreground">
            Link the ESP32 dispenser to this account before configuring compartments and schedules.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Create dispenser record</CardTitle>
              <CardDescription>
                This creates a Supabase `devices` row and three empty compartment rows for the ESP32 to report against.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="device-label" className="text-sm font-medium">
                  Device label
                </label>
                <Input
                  id="device-label"
                  value={deviceLabel}
                  onChange={(event) => setDeviceLabel(event.target.value)}
                  placeholder="Kitchen dispenser"
                />
              </div>
              <Button onClick={createDevice} disabled={creating}>
                {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Link dispenser
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expected ESP32 flow</CardTitle>
              <CardDescription>The device authenticates every request with `x-device-key`.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Endpoint method="POST" path="/api/devices/heartbeat" />
              <Endpoint method="GET" path="/api/devices/schedule" />
              <Endpoint method="GET" path="/api/devices/commands" />
              <Endpoint method="POST" path="/api/devices/dispense" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">ESP32 Dispenser Device</h1>
          <p className="text-muted-foreground">
            Supabase is the source of truth for heartbeat, schedules, commands, dispense events, and alerts.
          </p>
        </div>
        <Button variant="outline" onClick={load}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Connection"
          value={online ? "Online" : "Offline"}
          description={`Last seen ${relativeTime(device.last_seen_at)}`}
          icon={online ? Wifi : WifiOff}
          tone={online ? "text-emerald-600" : "text-destructive"}
        />
        <MetricCard
          title="Compartments"
          value={`${compartments.length}/3`}
          description={`${totalPills} pills loaded`}
          icon={Pill}
          tone="text-primary"
        />
        <MetricCard
          title="Active schedules"
          value={String(activeSchedules)}
          description={`${schedules.length} total rules`}
          icon={Calendar}
          tone="text-sky-700 dark:text-sky-300"
        />
        <MetricCard
          title="Firmware"
          value={device.firmware ?? "Unreported"}
          description={device.label ?? "ESP32 dispenser"}
          icon={HardDrive}
          tone="text-muted-foreground"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Device identity</CardTitle>
                  <CardDescription>Use this key in the ESP32 firmware request header.</CardDescription>
                </div>
                <Badge variant={online ? "default" : "destructive"}>{online ? "Receiving heartbeat" : "Heartbeat missing"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <InfoTile label="Device ID" value={device.id} />
                <InfoTile label="Label" value={device.label ?? "Unnamed dispenser"} />
              </div>
              <div className="rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Device key</p>
                  <Button variant="outline" size="sm" onClick={copyDeviceKey}>
                    <Copy className="size-4" />
                    Copy
                  </Button>
                </div>
                <code className="block break-all rounded bg-muted p-3 text-xs">{device.device_key}</code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Compartments</CardTitle>
                  <CardDescription>Loaded medication inventory used by schedules and low-stock notifications.</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/medications">
                    <Settings2 className="size-4" />
                    Edit medications
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total fill level</span>
                  <span className="font-medium">{fillPercent}%</span>
                </div>
                <Progress value={fillPercent} />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slot</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compartments.map((compartment) => {
                    const percent = compartment.capacity > 0 ? Math.round((compartment.pill_count / compartment.capacity) * 100) : 0

                    return (
                      <TableRow key={compartment.id}>
                        <TableCell className="font-medium">Slot {compartment.slot}</TableCell>
                        <TableCell>
                          {compartment.medication_name ? (
                            <div>
                              <p>{compartment.medication_name}</p>
                              {compartment.dosage_mg && (
                                <p className="text-xs text-muted-foreground">{compartment.dosage_mg} mg</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not configured</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="w-28 space-y-1">
                            <Progress
                              value={percent}
                              className={cn(
                                "h-2",
                                percent <= 15 && "[&>div]:bg-destructive",
                                percent > 15 && percent <= 30 && "[&>div]:bg-amber-500",
                              )}
                            />
                            <p className="text-xs text-muted-foreground">
                              {compartment.pill_count}/{compartment.capacity}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{relativeTime(compartment.updated_at)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Schedules exposed to ESP32</CardTitle>
                  <CardDescription>The ESP32 polls active schedules from Supabase through the schedule API.</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/schedules">
                    <Calendar className="size-4" />
                    Manage schedules
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        No schedules yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{formatScheduleTime(schedule.dispense_time)}</TableCell>
                      <TableCell>
                        Slot {schedule.compartments?.slot ?? "?"}
                        {schedule.compartments?.medication_name && (
                          <span className="block text-xs text-muted-foreground">{schedule.compartments.medication_name}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {schedule.days_of_week.map((day) => dayLabels[day]).join(", ")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={schedule.active ? "default" : "secondary"}>
                          {schedule.active ? "Active" : "Paused"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="size-5" />
                ESP32 API contract
              </CardTitle>
              <CardDescription>All requests must include `x-device-key: {device.device_key}`.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Endpoint method="POST" path="/api/devices/heartbeat" />
              <Endpoint method="GET" path="/api/devices/schedule" />
              <Endpoint method="GET" path="/api/devices/commands" />
              <Endpoint method="POST" path="/api/devices/dispense" />
              <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                Dispense reports with `status: "success"`, `"missed"`, or `"jammed"` are stored in Supabase.
                Missed, jammed, and low-stock events create notification rows.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent dispenser events</CardTitle>
              <CardDescription>Latest rows from `dispense_events`.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.length === 0 && (
                <div className="rounded-md border p-3 text-sm text-muted-foreground">
                  No dispense events reported yet.
                </div>
              )}
              {events.map((event) => (
                <div key={event.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">
                      Slot {event.slot ?? "?"}
                      {event.compartments?.medication_name ? ` · ${event.compartments.medication_name}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.triggered_by} · {relativeTime(event.dispensed_at)}
                    </p>
                  </div>
                  {statusBadge(event.status)}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ActionLink href="/medications" icon={Pill} label="Load compartment medication" />
              <ActionLink href="/schedules" icon={Clock} label="Create dispense schedule" />
              <ActionLink href="/dispenser" icon={Router} label="Send manual dispense command" />
              <ActionLink href="/notifications" icon={AlertTriangle} label="Review device notifications" />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  tone: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className={cn("flex size-10 items-center justify-center rounded-md bg-muted", tone)}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="break-all text-sm font-medium">{value}</p>
    </div>
  )
}

function Endpoint({ method, path }: { method: string; path: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
      <span className="font-mono text-xs">{path}</span>
      <Badge variant="outline">{method}</Badge>
    </div>
  )
}

function ActionLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <Button variant="ghost" className="w-full justify-start" asChild>
      <Link href={href}>
        <Icon className="size-4" />
        {label}
      </Link>
    </Button>
  )
}
