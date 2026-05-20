"use client"

import { HardDrive, Wifi, Battery, AlertTriangle, Shield, Download, Zap, Activity, RefreshCw, Search, FileText, ChevronRight } from "lucide-react"
import Link from "next/link"

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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { devices, connectivityPulse, type DeviceStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function getStatusBadge(status: DeviceStatus) {
  switch (status) {
    case "Online":
      return <Badge className="bg-green-500">Online</Badge>
    case "Offline":
      return <Badge variant="destructive">Offline</Badge>
    case "Warning":
      return <Badge className="bg-amber-500">Warning</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const chartConfig = {
  latency: {
    label: "Latency (ms)",
    color: "hsl(var(--foreground))",
  },
}

export default function DevicesPage() {
  const activeDevices = devices.filter((d) => d.status === "Online").length
  const totalDevices = devices.length
  const connectivityRate = Math.round((activeDevices / totalDevices) * 100 * 10) / 10
  const lowBatteryCount = devices.filter((d) => d.battery < 20).length
  const currentFirmware = "v2.4.1"

  const selectedDevice = devices[0]

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Devices & IoT Management</h1>
          <p className="text-muted-foreground">Monitor dispenser health, manage firmware, and troubleshoot connection diagnostics.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 size-4" />
            Export Report
          </Button>
          <Button>
            <Zap className="mr-2 size-4" />
            Deploy All Firmware
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <HardDrive className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Devices</p>
              <p className="text-2xl font-bold">
                1,248 <span className="text-sm font-normal text-green-600">+12 this month</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Wifi className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connectivity Rate</p>
              <p className="text-2xl font-bold">
                {connectivityRate}% <span className="text-sm font-normal text-green-600">+0.4% connectivity rate</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-100">
              <Battery className="size-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Battery Alerts</p>
              <p className="text-2xl font-bold">{lowBatteryCount > 0 ? lowBatteryCount : 24}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Shield className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Firmware</p>
              <p className="text-2xl font-bold">{currentFirmware}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Device inventory table */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Asset Inventory</CardTitle>
                  <CardDescription>Comprehensive list of all dispensing units associated with your clinic account.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Filter by ID or Model..." className="pl-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Battery</TableHead>
                    <TableHead>Firmware</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.id}</TableCell>
                      <TableCell>{device.model}</TableCell>
                      <TableCell>{getStatusBadge(device.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Progress 
                            value={device.battery} 
                            className={cn(
                              "h-2 w-20",
                              device.battery < 20 && "[&>div]:bg-red-500",
                              device.battery >= 20 && device.battery < 50 && "[&>div]:bg-amber-500"
                            )}
                          />
                          <span className="text-xs text-muted-foreground">{device.battery}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{device.firmware}</TableCell>
                      <TableCell>{device.latency}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dispenser?id=${device.id}`}>
                            <Activity className="size-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Live Diagnostics */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="size-5" />
                    Live Diagnostics: {selectedDevice.id}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="gap-1">
                  <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                  Stream Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Live metrics */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Motor Torque", value: "0.84", unit: "Nm", live: true },
                  { label: "Core Temp", value: "38.2", unit: "°C", live: true },
                  { label: "Signal Strength", value: "-62", unit: "dBm", live: true },
                  { label: "Voltage", value: "3.78", unit: "V", live: true },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-lg border p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                      {metric.label}
                      {metric.live && (
                        <Badge variant="outline" className="gap-1 text-[10px]">
                          <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                          Live
                        </Badge>
                      )}
                    </div>
                    <p className="text-xl font-bold">
                      {metric.value} <span className="text-sm font-normal text-muted-foreground">{metric.unit}</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Connectivity chart */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-medium">Connectivity Pulse</h4>
                  <Badge variant="outline">Stabilized</Badge>
                </div>
                <p className="mb-4 text-xs text-muted-foreground">Average network latency (round-trip time) for the last 45 minutes.</p>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={connectivityPulse}>
                      <XAxis dataKey="time" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="latency"
                        stroke="hsl(var(--foreground))"
                        fill="hsl(var(--muted))"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">
          {/* Firmware Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5" />
                  Firmware Management
                </CardTitle>
                <Badge variant="secondary">Ready</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm text-muted-foreground">Current Version</p>
                  <p className="font-semibold">{currentFirmware}</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">Up to date</Badge>
              </div>
              <Button variant="outline" className="w-full">
                <RefreshCw className="mr-2 size-4" />
                Check for updates
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 size-4" />
                View Hardware Logs
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="size-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Actions below may disconnect the device from the patient network temporarily.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="destructive" size="sm" className="flex-1">Factory Reset</Button>
              <Button variant="outline" size="sm" className="flex-1 border-red-200 text-red-600 hover:bg-red-50">Reboot</Button>
            </CardContent>
          </Card>

          {/* Quick Access */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-between" asChild>
                <Link href="/dispenser">
                  <span className="flex items-center gap-2">
                    <Activity className="size-4" />
                    Device Controller
                  </span>
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
              <Button variant="ghost" className="justify-between" asChild>
                <Link href="/help">
                  <span className="flex items-center gap-2">
                    <Shield className="size-4" />
                    IoT Security Docs
                  </span>
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
