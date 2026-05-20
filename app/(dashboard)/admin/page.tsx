"use client"

import { Shield, Users, Activity, HardDrive, AlertTriangle, Download, RefreshCw, Pill, TrendingUp, TrendingDown, CheckCircle, XCircle, Clock, Settings2, ChevronRight } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import { adminStats, dispensingStats, devices, medicationCatalog } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const statCards = [
  {
    label: "Active Users",
    value: adminStats.activeUsers.toLocaleString(),
    trend: adminStats.userGrowth,
    trendUp: true,
    icon: Users,
  },
  {
    label: "Device Health",
    value: `${adminStats.deviceHealth}%`,
    trend: adminStats.deviceHealthTrend,
    trendUp: true,
    icon: HardDrive,
  },
  {
    label: "Total Dispensed",
    value: adminStats.totalDispensed,
    trend: adminStats.dispensedGrowth,
    trendUp: true,
    icon: Pill,
  },
  {
    label: "System Alerts",
    value: adminStats.systemAlerts,
    trend: adminStats.alertsTrend,
    trendUp: false,
    icon: AlertTriangle,
  },
]

const chartConfig = {
  successful: { label: "Successful", color: "hsl(var(--foreground))" },
  requested: { label: "Requested", color: "hsl(var(--muted-foreground))" },
}

const systemLogs = [
  { id: "LOG-001", time: "Today 14:22", event: "Firmware OTA pushed to 142 devices", level: "info" },
  { id: "LOG-002", time: "Today 12:05", event: "Device SPD-1024-A went offline unexpectedly", level: "error" },
  { id: "LOG-003", time: "Today 10:48", event: "User PAT-8821 exceeded daily dosage threshold — dispense blocked", level: "warning" },
  { id: "LOG-004", time: "Today 09:15", event: "Scheduled backup completed successfully (12,482 records)", level: "info" },
  { id: "LOG-005", time: "Yesterday 23:59", event: "Daily medication adherence report generated", level: "info" },
  { id: "LOG-006", time: "Yesterday 18:33", event: "Caregiver approval request timed out for PAT-4410", level: "warning" },
]

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">System-wide health, analytics, and device management.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 bg-green-50 text-green-700">
            <span className="size-2 rounded-full bg-green-500" />
            All Systems Operational
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex flex-col gap-3 py-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                <stat.icon className="size-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
              <div className="flex items-center gap-1 text-xs">
                {stat.trendUp ? (
                  <TrendingUp className="size-3 text-green-600" />
                ) : (
                  <TrendingDown className="size-3 text-green-600" />
                )}
                <span className={stat.trendUp ? "text-green-600" : "text-green-600"}>{stat.trend} vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Dispensing chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="size-5" />
                  Weekly Dispensing Statistics
                </CardTitle>
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 size-4" />
                  Refresh
                </Button>
              </div>
              <CardDescription>Successful vs requested dispenses across all devices.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dispensingStats} barGap={4}>
                    <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="requested" fill="hsl(var(--muted-foreground))" opacity={0.4} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="successful" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Device health table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="size-5" />
                  Device Fleet Health
                </CardTitle>
                <Button variant="link" size="sm" asChild>
                  <Link href="/devices">Manage All Devices</Link>
                </Button>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-mono text-sm">{device.id}</TableCell>
                      <TableCell className="font-medium">{device.model}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            device.status === "Online" && "bg-green-50 text-green-700 border-green-200",
                            device.status === "Warning" && "bg-amber-50 text-amber-700 border-amber-200",
                            device.status === "Offline" && "bg-red-50 text-red-700 border-red-200",
                          )}
                        >
                          {device.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={device.battery} className="h-1.5 w-16" />
                          <span className="text-sm text-muted-foreground">{device.battery}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{device.firmware}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Medication catalog */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="size-5" />
                  Medication Catalog
                </CardTitle>
                <Button size="sm">Add Medication</Button>
              </div>
              <CardDescription>Manage approved medications available for dispensing.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Therapeutic Class</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicationCatalog.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell className="font-medium">{med.commonName}</TableCell>
                      <TableCell className="text-muted-foreground">{med.therapeuticClass}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{med.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            med.status === "Approved" && "bg-green-50 text-green-700 border-green-200",
                            med.status === "Review" && "bg-amber-50 text-amber-700 border-amber-200",
                          )}
                        >
                          {med.status === "Approved" ? <CheckCircle className="mr-1 size-3" /> : <Clock className="mr-1 size-3" />}
                          {med.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">
          {/* System logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="size-5" />
                System Event Log
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {systemLogs.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3",
                    log.level === "error" && "border-red-200 bg-red-50",
                    log.level === "warning" && "border-amber-200 bg-amber-50",
                  )}
                >
                  {log.level === "info" && <CheckCircle className="size-4 shrink-0 text-green-600 mt-0.5" />}
                  {log.level === "warning" && <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />}
                  {log.level === "error" && <XCircle className="size-4 shrink-0 text-red-600 mt-0.5" />}
                  <div>
                    <p className="text-xs text-muted-foreground">{log.time}</p>
                    <p className="text-sm">{log.event}</p>
                  </div>
                </div>
              ))}
              <Button variant="link" className="justify-start p-0 text-sm">View full event log &rarr;</Button>
            </CardContent>
          </Card>

          {/* Firmware update card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="size-5" />
                Firmware Update
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Latest: v1.5.0</span>
                  <Badge className="bg-blue-500">Available</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Improves motor timing and adds offline mode v2.</p>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Devices on v1.4.x</span>
                  <span className="font-medium">142</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Devices on v1.3.x</span>
                  <span className="font-medium">38</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already on v1.5.0</span>
                  <span className="font-medium text-green-600">21</span>
                </div>
              </div>
              <Button className="w-full">
                <RefreshCw className="mr-2 size-4" />
                Push OTA to All Devices
              </Button>
            </CardContent>
          </Card>

          {/* Admin quick actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5" />
                Admin Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {[
                { label: "Export User Report", href: "#" },
                { label: "Run System Diagnostics", href: "/devices" },
                { label: "Manage Permissions", href: "/caregivers" },
                { label: "View Notification Logs", href: "/notifications" },
              ].map((action) => (
                <Button key={action.label} variant="ghost" className="justify-between" asChild>
                  <Link href={action.href}>
                    {action.label}
                    <ChevronRight className="size-4" />
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
