"use client"

import { useState } from "react"
import { Users, Stethoscope, Shield, Mail, Phone, Clock, CheckCircle, AlertTriangle, Settings, MoreHorizontal, Download, Eye, EyeOff } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { caregivers } from "@/lib/mock-data"

export default function CaregiversPage() {
  const [showForm, setShowForm] = useState(true)
  const [selectedRole, setSelectedRole] = useState<string>("doctor")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["read"])

  const linkedDoctors = caregivers.filter((c) => c.role === "Doctor")
  const activeCaregivers = caregivers.filter((c) => c.role !== "Doctor")

  const getPermissionBadge = (permission: string) => {
    const colors: Record<string, string> = {
      Read: "bg-blue-100 text-blue-700",
      "Device Control": "bg-amber-100 text-amber-700",
      "Approval Auth": "bg-red-100 text-red-700",
    }
    return colors[permission] || "bg-muted text-muted-foreground"
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Settings</span>
        <span>&rsaquo;</span>
        <span className="text-foreground">Caregivers & Permissions</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Manage Your Support Network</h1>
          <p className="text-muted-foreground">
            Connect with your healthcare providers and family members to share access to your medication schedules and device controls.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2" />
            Export Access Log
          </Button>
          <Button variant="outline" onClick={() => setShowForm(!showForm)}>
            {showForm ? <EyeOff className="mr-2" /> : <Eye className="mr-2" />}
            {showForm ? "Hide Form" : "Show Form"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats Cards */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Stethoscope className="size-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Linked Doctors</div>
                <div className="text-3xl font-bold">{linkedDoctors.length}</div>
                <div className="text-xs text-muted-foreground">Clinical oversight approved</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="size-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Active Caregivers</div>
                <div className="text-3xl font-bold">{activeCaregivers.length}</div>
                <div className="text-xs text-muted-foreground">{activeCaregivers.filter(c => c.role === "Family").length} Family members, {activeCaregivers.filter(c => c.role === "Caregiver").length} Professional</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Recommendation */}
      <Card className="bg-muted/50 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Security Recommendation</div>
              <p className="text-sm text-muted-foreground">
                Review permissions every 90 days. We noticed &apos;Linda Johnson&apos; has full Approval Authority.
              </p>
              <Button variant="link" className="p-0 h-auto text-primary">Review Permissions</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invite Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Invite a Professional or Family Member</CardTitle>
              <CardDescription>
                The recipient will receive an email with instructions to join your care team.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input id="email" placeholder="doctor@clinic.com" className="pl-10" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Role Selection</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant={selectedRole === "doctor" ? "default" : "outline"}
                    onClick={() => setSelectedRole("doctor")}
                    className="flex-1"
                  >
                    <Stethoscope className="mr-2" />
                    Doctor
                  </Button>
                  <Button
                    variant={selectedRole === "caregiver" ? "default" : "outline"}
                    onClick={() => setSelectedRole("caregiver")}
                    className="flex-1"
                  >
                    <Users className="mr-2" />
                    Caregiver
                  </Button>
                  <Button
                    variant={selectedRole === "family" ? "default" : "outline"}
                    onClick={() => setSelectedRole("family")}
                    className="flex-1"
                  >
                    <Shield className="mr-2" />
                    Family
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Default Permissions</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Card
                    className={`cursor-pointer p-3 ${selectedPermissions.includes("read") ? "border-primary bg-primary/5" : ""}`}
                    onClick={() => {
                      if (selectedPermissions.includes("read")) {
                        setSelectedPermissions(selectedPermissions.filter((p) => p !== "read"))
                      } else {
                        setSelectedPermissions([...selectedPermissions, "read"])
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="size-4 text-blue-600" />
                      <span className="font-medium text-sm">Read-Only</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">View logs & schedules</p>
                  </Card>
                  <Card
                    className={`cursor-pointer p-3 ${selectedPermissions.includes("control") ? "border-primary bg-primary/5" : ""}`}
                    onClick={() => {
                      if (selectedPermissions.includes("control")) {
                        setSelectedPermissions(selectedPermissions.filter((p) => p !== "control"))
                      } else {
                        setSelectedPermissions([...selectedPermissions, "control"])
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="size-4 text-amber-600" />
                      <span className="font-medium text-sm">Remote Control</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Manual dispense access</p>
                  </Card>
                  <Card
                    className={`cursor-pointer p-3 ${selectedPermissions.includes("approval") ? "border-primary bg-primary/5" : ""}`}
                    onClick={() => {
                      if (selectedPermissions.includes("approval")) {
                        setSelectedPermissions(selectedPermissions.filter((p) => p !== "approval"))
                      } else {
                        setSelectedPermissions([...selectedPermissions, "approval"])
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="size-4 text-red-600" />
                      <span className="font-medium text-sm">Approval Authority</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Override critical alerts</p>
                  </Card>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="note">Personal Note (Optional)</Label>
                <Textarea
                  id="note"
                  placeholder="Hi Dr. Mitchell, please join my health portal to monitor my new medication cycle..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Send Invitation</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Connections */}
        <Card className={showForm ? "" : "lg:col-span-2"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Connections</CardTitle>
                <CardDescription>Manage who can see your data and control your dispenser.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="Filter by name..." className="w-48" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caregivers.map((caregiver) => (
                  <TableRow key={caregiver.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={caregiver.avatar} />
                          <AvatarFallback>{caregiver.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{caregiver.name}</div>
                          <div className="text-xs text-muted-foreground">{caregiver.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{caregiver.role}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 flex-wrap">
                        {caregiver.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className={`text-xs ${getPermissionBadge(permission)}`}>
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={`size-2 rounded-full ${caregiver.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span className="text-sm">{caregiver.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{caregiver.lastActive}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Permissions</DropdownMenuItem>
                          <DropdownMenuItem>View Activity</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Remove Access</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <span>Showing {caregivers.length} of {caregivers.length} active and pending connections.</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permission Levels Accordion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="permissions">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Shield className="size-4" />
                Understanding Permission Levels
              </div>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="size-3 rounded-full bg-blue-500 mt-1.5" />
                <div>
                  <div className="font-medium">Read Access</div>
                  <p className="text-sm text-muted-foreground">
                    Allows viewing your current medications, dosage history, and symptoms. Recommended for family members.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-3 rounded-full bg-amber-500 mt-1.5" />
                <div>
                  <div className="font-medium">Device Control</div>
                  <p className="text-sm text-muted-foreground">
                    Allows triggering manual dispenses and unlocking the device remotely. Essential for in-home caregivers.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-3 rounded-full bg-red-500 mt-1.5" />
                <div>
                  <div className="font-medium">Approval Authority</div>
                  <p className="text-sm text-muted-foreground">
                    Allows approving &quot;As-Needed&quot; painkiller requests and overriding safety lockouts. Recommended for doctors only.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Emergency Protocol */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Emergency Protocol</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Linked doctors and primary caregivers are automatically notified via SMS if the device fails to dispense or a critical alert is triggered.
                </p>
                <Button variant="outline" className="mt-3">Configure Emergency Routing</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
