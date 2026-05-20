"use client"

import { useState } from "react"
import { Bell, Check, Download, Filter, AlertTriangle, Pill, HardDrive, Settings, MoreVertical, CheckCircle, Clock, Smartphone, Mail, MessageSquare } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { notifications } from "@/lib/mock-data"

export default function NotificationsPage() {
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredNotifications = notifications.filter((n) => {
    if (filter !== "all" && n.type !== filter) return false
    if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const highPriority = filteredNotifications.filter((n) => n.priority === "high")
  const recentUpdates = filteredNotifications.filter((n) => n.priority !== "high")

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "medication":
        return <Pill className="text-primary" />
      case "device":
        return <HardDrive className="text-muted-foreground" />
      case "system":
        return <Settings className="text-muted-foreground" />
      default:
        return <Bell className="text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-destructive"
      case "medium":
        return "text-amber-600"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Notifications Center</h1>
          <Badge variant="secondary">3 New</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Check className="mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline">
            <Download className="mr-2" />
            Export Log
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground -mt-4">Monitor and respond to critical alerts and system updates.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Notifications List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search alerts by medication, type, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={filter === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button 
                variant={filter === "emergency" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilter("emergency")}
                className={filter === "emergency" ? "" : "text-destructive border-destructive/50"}
              >
                Emergency
              </Button>
              <Button 
                variant={filter === "medication" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilter("medication")}
              >
                Medication
              </Button>
              <Button 
                variant={filter === "device" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilter("device")}
              >
                Device
              </Button>
            </div>
          </div>

          {/* High Priority Section */}
          {highPriority.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-4" />
                <span className="text-sm font-semibold uppercase tracking-wide">High Priority</span>
              </div>
              {highPriority.map((notification) => (
                <Card key={notification.id} className="border-destructive/30 bg-destructive/5">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 size-8 rounded-full bg-destructive/10 flex items-center justify-center">
                          <AlertTriangle className="size-4 text-destructive" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{notification.title}</span>
                            <Badge variant="outline" className="text-xs">{notification.type}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="size-3" />
                              {notification.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button size="sm" variant="outline">
                              <Check className="mr-1" />
                              Acknowledge
                            </Button>
                            <Button size="sm" variant="ghost">View Details</Button>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Mark as read</DropdownMenuItem>
                          <DropdownMenuItem>Snooze</DropdownMenuItem>
                          <DropdownMenuItem>View history</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Recent Updates Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Bell className="size-4" />
              <span className="text-sm font-semibold uppercase tracking-wide">Recent Updates</span>
            </div>
            {recentUpdates.map((notification) => (
              <Card key={notification.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 size-8 rounded-full bg-muted flex items-center justify-center ${getPriorityColor(notification.priority)}`}>
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{notification.title}</span>
                          <Badge variant="outline" className="text-xs">{notification.type}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" />
                            {notification.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {notification.priority !== "low" && (
                            <Button size="sm" variant="outline">
                              <Check className="mr-1" />
                              Acknowledge
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">View Details</Button>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Mark as read</DropdownMenuItem>
                        <DropdownMenuItem>Snooze</DropdownMenuItem>
                        <DropdownMenuItem>View history</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button variant="ghost" className="mx-auto">View Older Notifications</Button>
        </div>

        {/* Preferences Sidebar */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="size-4" />
                Preferences
              </CardTitle>
              <CardDescription>Configure how you receive alerts.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Delivery Channels */}
              <div className="flex flex-col gap-4">
                <span className="text-sm font-medium">Delivery Channels</span>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">Emergency Alerts</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <Switch defaultChecked />
                      <span className="text-xs text-muted-foreground">APP</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Switch />
                      <span className="text-xs text-muted-foreground">SMS</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Switch defaultChecked />
                      <span className="text-xs text-muted-foreground">EMAIL</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">Medication Reminders</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <Switch defaultChecked />
                      <span className="text-xs text-muted-foreground">APP</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Switch />
                      <span className="text-xs text-muted-foreground">SMS</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Switch defaultChecked />
                      <span className="text-xs text-muted-foreground">EMAIL</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">Device Status</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <Switch defaultChecked />
                      <span className="text-xs text-muted-foreground">APP</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Switch />
                      <span className="text-xs text-muted-foreground">SMS</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Switch defaultChecked />
                      <span className="text-xs text-muted-foreground">EMAIL</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Health Events */}
              <div className="flex flex-col gap-4">
                <span className="text-sm font-medium">Health Events</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Low Stock Warnings</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Caregiver Approvals</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Weekly Reports</span>
                  <Switch />
                </div>
              </div>

              <Button className="w-full">Save Preferences</Button>
            </CardContent>
          </Card>

          {/* Notification Health */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Health</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-xs text-muted-foreground">DELIVERY RATE</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">1.2s</div>
                  <div className="text-xs text-muted-foreground">AVG LATENCY</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                <CheckCircle className="size-4" />
                All alert systems are operational
              </div>
            </CardContent>
          </Card>

          {/* Pro Tip */}
          <Card className="bg-muted">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Clock className="size-5 mt-0.5 text-muted-foreground" />
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Pro Tip</span>
                  <p className="text-sm text-muted-foreground">
                    Connecting a secondary emergency contact ensures critical medication alerts are never missed.
                  </p>
                  <Button variant="link" className="p-0 h-auto justify-start text-primary">
                    Manage Caregivers &rarr;
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
