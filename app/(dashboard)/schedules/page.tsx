"use client"

import { useState } from "react"
import { Calendar, Clock, Plus, Download, Bell, Volume2, Users, Lock, Plane, MoreVertical, CheckCircle, ChevronDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fullDaySchedule, type DoseStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function getStatusBadge(status: DoseStatus) {
  switch (status) {
    case "Taken":
      return <Badge variant="secondary" className="bg-green-100 text-green-700">Taken</Badge>
    case "Missed":
      return <Badge variant="destructive">Missed</Badge>
    case "Due":
      return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Due</Badge>
    case "Upcoming":
      return <Badge variant="outline">Upcoming</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function SchedulesPage() {
  const [gracePeriod, setGracePeriod] = useState([30])
  const [audibleAlert, setAudibleAlert] = useState(true)
  const [caregiverNotification, setCaregiverNotification] = useState(true)
  const [lockCompartment, setLockCompartment] = useState(false)
  const [vacationMode, setVacationMode] = useState(false)

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Schedules & Rules</h1>
          <p className="text-muted-foreground">Manage dispense timings, missed dose logic, and safety exceptions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="mr-2 size-4" />
            Create Rule
          </Button>
          <Button variant="outline">
            <Download className="mr-2 size-4" />
            Export Log
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeline section */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Date selector and view toggle */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Today</Button>
              <span className="text-sm font-medium">Monday, Oct 24</span>
            </div>
            <Tabs defaultValue="timeline" className="ml-auto">
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Schedule timeline */}
          <Card>
            <CardContent className="py-6">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[88px] top-0 h-full w-px bg-border" />

                <div className="flex flex-col gap-6">
                  {fullDaySchedule.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-4">
                      {/* Time column */}
                      <div className="w-20 text-right">
                        <p className="font-semibold">{item.time}</p>
                      </div>

                      {/* Timeline dot */}
                      <div className={cn(
                        "relative z-10 flex size-3 shrink-0 rounded-full",
                        item.status === "Taken" && "bg-green-500",
                        item.status === "Missed" && "bg-red-500",
                        item.status === "Upcoming" && "bg-muted-foreground/30",
                        item.status === "Due" && "bg-amber-500"
                      )}>
                        {item.status === "Taken" && (
                          <CheckCircle className="absolute -left-1 -top-1 size-5 text-green-500" />
                        )}
                      </div>

                      {/* Content card */}
                      <Card className={cn(
                        "flex-1",
                        item.status === "Missed" && "border-red-200 bg-red-50"
                      )}>
                        <CardContent className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                              <CheckCircle className="size-4" />
                            </div>
                            <div>
                              <p className="font-medium">{item.medication}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.dosage} &bull; {item.pills} Pill &bull; Compartment {item.compartment}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(item.status)}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuGroup>
                                  <DropdownMenuItem>Edit Schedule</DropdownMenuItem>
                                  <DropdownMenuItem>Skip This Dose</DropdownMenuItem>
                                  <DropdownMenuItem>View History</DropdownMenuItem>
                                </DropdownMenuGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              {/* Empty state */}
              <Card className="mt-6 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="mb-2 size-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No more events for today</p>
                  <Button variant="link" className="mt-2">Add Medication</Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Rules sidebar */}
        <div className="flex flex-col gap-6">
          {/* Missed Dose Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5" />
                Missed Dose Rules
              </CardTitle>
              <CardDescription>Configure how the system handles doses not taken within the grace period.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Grace period slider */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Grace Period (Minutes)</span>
                  <span className="text-sm font-semibold">{gracePeriod[0]} min</span>
                </div>
                <Slider
                  value={gracePeriod}
                  onValueChange={setGracePeriod}
                  max={60}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Wait time after the scheduled hour before marking a dose as &quot;Missed&quot;.
                </p>
              </div>

              {/* Alert options */}
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="audible"
                    checked={audibleAlert}
                    onCheckedChange={(checked) => setAudibleAlert(!!checked)}
                  />
                  <div className="flex-1">
                    <label htmlFor="audible" className="flex items-center gap-2 text-sm font-medium">
                      <Bell className="size-4" />
                      Audible Device Alert
                    </label>
                    <p className="text-xs text-muted-foreground">Play a chime from the dispenser speaker when a dose is due.</p>
                  </div>
                  <Switch checked={audibleAlert} onCheckedChange={setAudibleAlert} />
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="caregiver"
                    checked={caregiverNotification}
                    onCheckedChange={(checked) => setCaregiverNotification(!!checked)}
                  />
                  <div className="flex-1">
                    <label htmlFor="caregiver" className="flex items-center gap-2 text-sm font-medium">
                      <Users className="size-4" />
                      Caregiver Notification
                    </label>
                    <p className="text-xs text-muted-foreground">Alert your primary caregiver if dose is missed for over 30 minutes.</p>
                  </div>
                  <Switch checked={caregiverNotification} onCheckedChange={setCaregiverNotification} />
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="lock"
                    checked={lockCompartment}
                    onCheckedChange={(checked) => setLockCompartment(!!checked)}
                  />
                  <div className="flex-1">
                    <label htmlFor="lock" className="flex items-center gap-2 text-sm font-medium">
                      <Lock className="size-4" />
                      Lock Compartment
                    </label>
                    <p className="text-xs text-muted-foreground">Prevent manual access to missed meds until doctor approval.</p>
                  </div>
                  <Checkbox checked={lockCompartment} onCheckedChange={(checked) => setLockCompartment(!!checked)} />
                </div>
              </div>

              <Button variant="outline" className="w-full">Save Changes</Button>
            </CardContent>
          </Card>

          {/* Vacation Mode */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Plane className="size-5" />
                  Vacation Mode
                </CardTitle>
                <Switch checked={vacationMode} onCheckedChange={setVacationMode} />
              </div>
              <CardDescription>Pause schedules while traveling.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {vacationMode 
                  ? "Schedules are paused. Remember to resume when you return."
                  : "System is currently in normal operation."
                }
              </p>
            </CardContent>
          </Card>

          {/* Frequency Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Frequency Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="dispense-windows" className="border-none">
                  <AccordionTrigger className="hover:no-underline">Global Dispense Windows</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Morning Window</span>
                        <span>06:00 - 10:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Evening Window</span>
                        <span>18:00 - 22:00</span>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2">Edit Windows</Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="refill-reminders" className="border-none">
                  <AccordionTrigger className="hover:no-underline">Smart Refill Reminders</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Automatically notify when medication supply drops below 5 days of estimated usage.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
