"use client"

import { User, Clock, Scale, Droplet, Phone, AlertTriangle, Mic, Stethoscope, Pill, FileText, Wifi, Battery, CheckCircle, Activity, HardDrive } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { currentPatient, todaySchedule, type DoseStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function getStatusColor(status: DoseStatus) {
  switch (status) {
    case "Taken":
      return "bg-green-100 text-green-700 border-green-200"
    case "Missed":
      return "bg-red-100 text-red-700 border-red-200"
    case "Due":
      return "bg-amber-100 text-amber-700 border-amber-200"
    case "Upcoming":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getStatusBadgeVariant(status: DoseStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Taken":
      return "secondary"
    case "Missed":
      return "destructive"
    case "Due":
      return "default"
    case "Upcoming":
      return "outline"
    default:
      return "outline"
  }
}

export default function DashboardPage() {
  const missedDose = todaySchedule.find((item) => item.status === "Missed")
  const remainingDoses = todaySchedule.filter((item) => item.status === "Due" || item.status === "Upcoming").length

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Patient Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {currentPatient.name.split(" ")[0]}. You have {remainingDoses} dose{remainingDoses !== 1 ? "s" : ""} remaining for today.
        </p>
      </div>

      {/* Patient info & Emergency contact */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Card className="flex-1">
          <CardContent className="flex flex-wrap items-center gap-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <User className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Patient</p>
                <p className="font-medium">{currentPatient.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <Clock className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Age</p>
                <p className="font-medium">{currentPatient.age} Years</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <Scale className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Weight</p>
                <p className="font-medium">{currentPatient.weight} kg</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <Droplet className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Blood Type</p>
                <p className="font-medium">{currentPatient.bloodType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-4">
            <div>
              <p className="text-xs text-red-600 uppercase tracking-wide">Emergency Contact</p>
              <p className="font-medium text-red-900">{currentPatient.emergencyContact.name} ({currentPatient.emergencyContact.relationship})</p>
            </div>
            <Button size="icon" variant="destructive" className="ml-auto rounded-full">
              <Phone className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content area */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Missed dose alert */}
          {missedDose && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-start gap-4 py-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="size-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">Missed Dose: {missedDose.medication} {missedDose.dosage}</h3>
                  <p className="text-sm text-red-700">
                    A dose scheduled for {missedDose.time} was missed. Please consult the Painkiller Flow or contact your clinician if needed.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="destructive">Acknowledge</Button>
                    <Button size="sm" variant="ghost" className="text-red-700 hover:bg-red-100">View Alert Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Today's medication schedule */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5" />
                  Today&apos;s Medication Schedule
                </CardTitle>
                <CardDescription>Chronological overview of your prescribed plan.</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href="/schedules">View Calendar</Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {todaySchedule.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-4 rounded-lg border p-4",
                    item.status === "Due" && "border-amber-300 bg-amber-50"
                  )}
                >
                  <div className="text-center">
                    <p className="font-semibold">{item.time}</p>
                    <p className="text-xs text-muted-foreground uppercase">Today</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.medication}</p>
                      {item.status === "Due" && (
                        <Badge variant="secondary" className="bg-amber-500 text-white">NOW</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.dosage} &bull; {item.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === "Due" ? (
                      <>
                        <Badge variant="outline" className="gap-1">
                          <Clock className="size-3" />
                          Due
                        </Badge>
                        <Button size="sm">Dispense</Button>
                      </>
                    ) : (
                      <Badge 
                        variant={getStatusBadgeVariant(item.status)}
                        className={cn("gap-1", item.status === "Taken" && "bg-green-100 text-green-700 border-green-200")}
                      >
                        {item.status === "Taken" && <CheckCircle className="size-3" />}
                        {item.status === "Missed" && <Clock className="size-3" />}
                        {item.status === "Upcoming" && <Clock className="size-3" />}
                        {item.status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Refill notification */}
          <div className="rounded-lg bg-muted py-3 text-center text-sm text-muted-foreground">
            Next refill expected in <strong className="text-foreground">5 days</strong> for Ibuprofen.
          </div>

          {/* Quick action cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: Mic, label: "Record Voice", href: "/voice-health" },
              { icon: Stethoscope, label: "Symptom Checker", href: "/symptom-checker" },
              { icon: Pill, label: "Pain Relief", href: "/painkiller" },
              { icon: FileText, label: "Refill Logs", href: "/medications" },
            ].map((action) => (
              <Card key={action.label} className="transition-colors hover:bg-muted/50">
                <Link href={action.href}>
                  <CardContent className="flex flex-col items-center justify-center gap-2 py-6">
                    <action.icon className="size-6 text-muted-foreground" />
                    <span className="text-sm font-medium uppercase tracking-wide">{action.label}</span>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">
          {/* Dispenser status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="size-5" />
                Dispenser Status
              </CardTitle>
              <CardDescription>Real-time telemetry from your smart unit.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <Battery className="size-4 text-muted-foreground" />
                    <Badge variant="secondary" className="text-xs">Excellent</Badge>
                  </div>
                  <p className="mt-2 text-2xl font-bold">84%</p>
                  <p className="text-xs text-muted-foreground">Approx. 14h left</p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <Wifi className="size-4 text-muted-foreground" />
                    <Badge variant="secondary" className="text-xs">Stable</Badge>
                  </div>
                  <p className="mt-2 text-2xl font-bold">42ms</p>
                  <p className="text-xs text-muted-foreground">Connected: Home_5G</p>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">System Status: Active</span>
                  <span className="text-xs text-muted-foreground">ID: SPD-4921-X</span>
                </div>
                <Progress value={100} className="mt-2 h-1" />
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">Run Diagnostics</Button>
                  <Button variant="outline" size="sm" className="flex-1">Firmware V1.4</Button>
                </div>
              </div>

              <Button variant="ghost" className="w-full justify-between" asChild>
                <Link href="/dispenser">
                  Detailed Device Dashboard
                  <span>&rarr;</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Health snapshot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5" />
                Health Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Mic className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Voice Health Score</p>
                    <p className="text-xl font-bold">82 <span className="text-sm font-normal text-muted-foreground">/100</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-green-600">+8%</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Stethoscope className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Symptom Trend</p>
                    <p className="text-xl font-bold">Moderate <span className="text-sm font-normal text-muted-foreground">Risk</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-red-600">+8%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reorder banner */}
          <Card className="bg-foreground text-background">
            <CardContent className="py-6 text-center">
              <p className="mb-4 text-sm">Your Ibuprofen and Metformin are below the refill threshold.</p>
              <Button variant="secondary" asChild>
                <Link href="/medications">Reorder Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
