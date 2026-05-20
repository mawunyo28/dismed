"use client"

import { useState } from "react"
import { Settings, User, Bell, Shield, Wifi, Palette, Key, Trash2, Eye, EyeOff, Save, ChevronRight, Smartphone, Moon, Sun } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Field, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { currentPatient } from "@/lib/mock-data"

type SettingsSection = "profile" | "notifications" | "security" | "device" | "appearance"

const sections: { id: SettingsSection; label: string; icon: React.ElementType; description: string }[] = [
  { id: "profile", label: "Profile & Account", icon: User, description: "Manage your personal details and patient information" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "Configure alerts, reminders, and caregiver notifications" },
  { id: "security", label: "Security & Privacy", icon: Shield, description: "Password, 2FA, and data privacy settings" },
  { id: "device", label: "Device & Connectivity", icon: Wifi, description: "IoT device pairing, WiFi, and firmware" },
  { id: "appearance", label: "Appearance", icon: Palette, description: "Theme and display preferences" },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile")
  const [showPassword, setShowPassword] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account, device, and notification preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Settings nav */}
        <Card className="h-fit lg:col-span-1">
          <CardContent className="flex flex-col gap-1 py-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted ${
                  activeSection === section.id ? "bg-muted font-medium" : "text-muted-foreground"
                }`}
              >
                <section.icon className="size-4 shrink-0" />
                {section.label}
                {activeSection === section.id && <ChevronRight className="ml-auto size-4" />}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Settings content */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          {activeSection === "profile" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="size-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your patient profile details.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="fullname">Full Name</FieldLabel>
                      <Input id="fullname" defaultValue={currentPatient.name} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="age">Age</FieldLabel>
                      <Input id="age" type="number" defaultValue={currentPatient.age} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="weight">Weight (kg)</FieldLabel>
                      <Input id="weight" type="number" defaultValue={currentPatient.weight} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="blood">Blood Type</FieldLabel>
                      <Select defaultValue="o_pos">
                        <SelectTrigger id="blood">
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a_pos">A+</SelectItem>
                          <SelectItem value="a_neg">A−</SelectItem>
                          <SelectItem value="b_pos">B+</SelectItem>
                          <SelectItem value="b_neg">B−</SelectItem>
                          <SelectItem value="ab_pos">AB+</SelectItem>
                          <SelectItem value="ab_neg">AB−</SelectItem>
                          <SelectItem value="o_pos">O+</SelectItem>
                          <SelectItem value="o_neg">O−</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="email">Email Address</FieldLabel>
                    <Input id="email" type="email" defaultValue="alex.johnson@email.com" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                    <Input id="phone" type="tel" defaultValue="(555) 987-6543" />
                  </Field>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Medical Context</CardTitle>
                  <CardDescription>Used by the safety engine for dispensing and symptom analysis.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Field>
                    <FieldLabel htmlFor="allergies">Known Allergies</FieldLabel>
                    <Input id="allergies" placeholder="e.g. Penicillin, Sulfa drugs" defaultValue="Sulfa drugs" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="conditions">Existing Conditions</FieldLabel>
                    <Input id="conditions" placeholder="e.g. Hypertension, Type 2 Diabetes" defaultValue="Hypertension, Type 2 Diabetes" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="doctor">Primary Doctor</FieldLabel>
                    <Input id="doctor" defaultValue="Dr. Sarah Mitchell" />
                  </Field>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} className={saved ? "bg-green-700" : ""}>
                  <Save className="mr-2 size-4" />
                  {saved ? "Saved!" : "Save Changes"}
                </Button>
              </div>
            </>
          )}

          {activeSection === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="size-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how and when you receive alerts and reminders.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {[
                  { id: "med-reminder", label: "Medication Reminders", description: "Alerts before each scheduled dose", defaultChecked: true },
                  { id: "missed-dose", label: "Missed Dose Alerts", description: "Notified when a dose window passes", defaultChecked: true },
                  { id: "refill-alert", label: "Refill Alerts", description: "Low stock warnings below threshold", defaultChecked: true },
                  { id: "caregiver-notify", label: "Caregiver Notifications", description: "Sync events to linked caregivers", defaultChecked: false },
                  { id: "health-alerts", label: "Health Risk Alerts", description: "From symptom checker and voice health", defaultChecked: true },
                  { id: "device-alerts", label: "Device Status Alerts", description: "Offline, jammed, or low battery events", defaultChecked: true },
                  { id: "emergency-alerts", label: "Emergency Alerts", description: "High-priority push + SMS for critical events", defaultChecked: true },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <Label htmlFor={item.id} className="font-medium">{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch id={item.id} defaultChecked={item.defaultChecked} />
                  </div>
                ))}

                <Separator />

                <div className="flex flex-col gap-4">
                  <p className="font-medium">Reminder Interval</p>
                  <Field>
                    <FieldLabel htmlFor="reminder-lead">Lead Time Before Dose</FieldLabel>
                    <Select defaultValue="15">
                      <SelectTrigger id="reminder-lead">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes before</SelectItem>
                        <SelectItem value="10">10 minutes before</SelectItem>
                        <SelectItem value="15">15 minutes before</SelectItem>
                        <SelectItem value="30">30 minutes before</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="contact-method">Preferred Contact Method</FieldLabel>
                    <Select defaultValue="push">
                      <SelectTrigger id="contact-method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="push">Push Notification</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="all">All Channels</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} className={saved ? "bg-green-700" : ""}>
                    <Save className="mr-2 size-4" />
                    {saved ? "Saved!" : "Save Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "security" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="size-5" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Field>
                    <FieldLabel htmlFor="current-pw">Current Password</FieldLabel>
                    <div className="relative">
                      <Input id="current-pw" type={showPassword ? "text" : "password"} placeholder="Enter current password" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="new-pw">New Password</FieldLabel>
                    <Input id="new-pw" type="password" placeholder="Minimum 10 characters" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-pw">Confirm New Password</FieldLabel>
                    <Input id="confirm-pw" type="password" placeholder="Repeat new password" />
                  </Field>
                  <Button className="w-fit">Update Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="size-5" />
                    Two-Factor Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Authenticator App (TOTP)</p>
                    <p className="text-sm text-muted-foreground">Use Google Authenticator or similar app.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Enabled</Badge>
                    <Button variant="outline" size="sm">Reconfigure</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="size-5" />
                    Data & Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {[
                    { label: "Share anonymised data for research", defaultChecked: false },
                    { label: "Allow voice scan data cloud backup", defaultChecked: true },
                    { label: "Allow caregivers to view dispensing logs", defaultChecked: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <Label className="font-medium max-w-xs">{item.label}</Label>
                      <Switch defaultChecked={item.defaultChecked} />
                    </div>
                  ))}

                  <Separator />

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Trash2 className="mr-2 size-4" />
                      Export My Data
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 size-4" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === "device" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="size-5" />
                    Device Connection
                  </CardTitle>
                  <CardDescription>Manage your paired Smart Pill Dispenser hardware.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Device ID: SPD-4921-X</p>
                      <p className="text-sm text-muted-foreground">Firmware v1.4 &bull; Last seen: 2 min ago &bull; IP: 192.168.1.44</p>
                    </div>
                    <Badge className="bg-green-500">Online</Badge>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="wifi-ssid">WiFi Network (SSID)</FieldLabel>
                    <Input id="wifi-ssid" defaultValue="Home_5G" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="refill-threshold">Refill Alert Threshold (pills)</FieldLabel>
                    <Input id="refill-threshold" type="number" defaultValue={10} />
                  </Field>
                  <div className="flex gap-2">
                    <Button variant="outline">Run Diagnostics</Button>
                    <Button variant="outline">Unpair Device</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manual Override PIN</CardTitle>
                  <CardDescription>Emergency PIN used for manual physical dispensing when connectivity fails.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Field>
                    <FieldLabel htmlFor="override-pin">6-Digit Override PIN</FieldLabel>
                    <Input id="override-pin" type="password" defaultValue="••••••" maxLength={6} />
                  </Field>
                  <Button className="w-fit" onClick={handleSave}>
                    <Save className="mr-2 size-4" />
                    {saved ? "Saved!" : "Update PIN"}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="size-5" />
                  Display Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div>
                  <p className="mb-3 font-medium">Theme</p>
                  <div className="flex gap-3">
                    {[
                      { id: "light", label: "Light", icon: Sun },
                      { id: "dark", label: "Dark", icon: Moon },
                      { id: "system", label: "System", icon: Palette },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        className={`flex flex-1 flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-muted ${
                          theme.id === "light" ? "border-foreground" : ""
                        }`}
                      >
                        <theme.icon className="size-5" />
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-4">
                  {[
                    { label: "Compact sidebar mode", defaultChecked: false },
                    { label: "Show dose countdown timers", defaultChecked: true },
                    { label: "Animate charts and progress bars", defaultChecked: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <Label className="font-medium">{item.label}</Label>
                      <Switch defaultChecked={item.defaultChecked} />
                    </div>
                  ))}
                </div>

                <Field>
                  <FieldLabel htmlFor="language">Language</FieldLabel>
                  <Select defaultValue="en">
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <div className="flex justify-end">
                  <Button onClick={handleSave} className={saved ? "bg-green-700" : ""}>
                    <Save className="mr-2 size-4" />
                    {saved ? "Saved!" : "Save Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
