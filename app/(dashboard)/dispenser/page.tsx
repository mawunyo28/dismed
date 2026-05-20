"use client"

import { HardDrive, Wifi, Battery, Thermometer, Activity, Play, Lock, AlertTriangle, RefreshCw, Download, Pill, Clock, CheckCircle, XCircle, Settings } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { currentDevice, compartments, dispensingHistory, connectivityPulse, type CompartmentStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function getCompartmentClass(status: CompartmentStatus) {
  switch (status) {
    case "filled":
      return "bg-muted hover:bg-muted/80"
    case "empty":
      return "bg-background border-dashed"
    case "jammed":
      return "bg-red-100 border-red-300"
    default:
      return "bg-muted"
  }
}

const chartConfig = {
  latency: {
    label: "Latency (ms)",
    color: "hsl(var(--foreground))",
  },
}

export default function DispenserPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Device header */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Pill className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">Device: {currentDevice.id}</h1>
                <Badge className="bg-green-500">{currentDevice.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Firmware: {currentDevice.firmware} &bull; Latency: {currentDevice.latency} &bull; Last Seen: {currentDevice.lastSeen}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/devices">
                <RefreshCw className="mr-2 size-4" />
                Diagnostics
              </Link>
            </Button>
            <Button asChild>
              <Link href="/medications">
                <Settings className="mr-2 size-4" />
                Manage Pills
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vital stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Wifi className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">WiFi Signal</p>
              <p className="text-xl font-bold">{currentDevice.wifiSignal}</p>
              <p className="text-xs text-muted-foreground uppercase">Strength</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Battery className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Battery Life</p>
              <p className="text-xl font-bold">{currentDevice.batteryLife}</p>
              <p className="text-xs text-muted-foreground uppercase">Percent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Thermometer className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Dispenser Temp</p>
              <p className="text-xl font-bold">{currentDevice.temperature}</p>
              <p className="text-xs text-muted-foreground uppercase">Celsius</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
              <Activity className="size-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Sensor Load</p>
              <p className="text-xl font-bold">{currentDevice.sensorLoad}</p>
              <p className="text-xs text-muted-foreground uppercase">Status</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Compartment visualization */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Compartment Visualization</CardTitle>
                  <CardDescription>Real-time physical state of individual pill slots</CardDescription>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <span className="size-3 rounded bg-muted" /> Filled
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-3 rounded border border-dashed bg-background" /> Empty
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-3 rounded bg-red-200" /> Jammed
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {compartments.map((comp) => (
                  <div
                    key={comp.id}
                    className={cn(
                      "relative flex aspect-square items-center justify-center rounded-lg border transition-colors",
                      getCompartmentClass(comp.status)
                    )}
                  >
                    <span className="absolute left-1 top-1 text-[10px] text-muted-foreground">{comp.id}</span>
                    <Pill className={cn(
                      "size-5",
                      comp.status === "filled" && "text-muted-foreground",
                      comp.status === "empty" && "text-muted-foreground/30",
                      comp.status === "jammed" && "text-red-500"
                    )} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dispensing History Log */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="size-5" />
                    Dispensing History Log
                  </CardTitle>
                  <CardDescription>Comprehensive audit trail of hardware events</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 size-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Compartment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Technical Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dispensingHistory.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-muted-foreground">{event.timestamp}</TableCell>
                      <TableCell className="font-medium">{event.eventType}</TableCell>
                      <TableCell>{event.compartment ?? "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={event.status === "Failed" ? "destructive" : "secondary"}
                          className={cn(
                            event.status === "Success" && "bg-green-100 text-green-700",
                            event.status === "Completed" && "bg-blue-100 text-blue-700"
                          )}
                        >
                          {event.status === "Success" && <CheckCircle className="mr-1 size-3" />}
                          {event.status === "Failed" && <XCircle className="mr-1 size-3" />}
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground italic">{event.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">
          {/* System Controls */}
          <Card>
            <CardHeader>
              <CardTitle>System Controls</CardTitle>
              <CardDescription>Execute manual hardware overrides</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button className="w-full justify-start">
                <Play className="mr-2 size-4" />
                Manual Dispense
              </Button>
              <p className="text-xs text-muted-foreground">Dispense next scheduled medication now</p>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start">
                  <Lock className="mr-2 size-4" />
                  Lock Device
                </Button>
                <Button variant="outline" className="justify-start">
                  <AlertTriangle className="mr-2 size-4" />
                  Override
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Safety lockout</span>
                <span>Bypass safety limits</span>
              </div>
            </CardContent>
          </Card>

          {/* Firmware Update */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Firmware Update</CardTitle>
                <Badge variant="secondary">Ready</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Start Update to v2.4.2
              </Button>
            </CardContent>
          </Card>

          {/* Connection Stability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5" />
                Connection Stability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={connectivityPulse}>
                    <XAxis dataKey="time" tickLine={false} axisLine={false} fontSize={10} />
                    <YAxis tickLine={false} axisLine={false} fontSize={10} domain={[0, 32]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="latency"
                      stroke="hsl(var(--foreground))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--foreground))", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
