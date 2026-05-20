"use client"

import { useState } from "react"
import { Pill, ShieldCheck, AlertTriangle, Clock, CheckCircle, XCircle, Info, ChevronRight, Heart, User, Scale, Activity, Lock, History } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { currentPatient } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type EligibilityStatus = "eligible" | "denied" | "pending" | "caregiver-required"

interface SafetyCheck {
  label: string
  status: "pass" | "fail" | "warning"
  detail: string
}

const dailyUsageHistory = [
  { time: "08:15 AM", medication: "Acetaminophen 500mg", dose: "1 tablet", status: "Dispensed" },
  { time: "02:30 PM", medication: "Ibuprofen 400mg", dose: "1 tablet", status: "Dispensed" },
  { time: "Yesterday", medication: "Acetaminophen 500mg", dose: "2 tablets", status: "Dispensed" },
  { time: "Yesterday", medication: "Acetaminophen 500mg", dose: "1 tablet", status: "Denied – Max dose" },
]

const safetyChecks: SafetyCheck[] = [
  { label: "Allergy Check", status: "pass", detail: "No known allergy to Acetaminophen" },
  { label: "Last Dose Interval", status: "pass", detail: "Last dose was 4h 12m ago (≥ 4h required)" },
  { label: "Daily Limit", status: "warning", detail: "1,000mg taken today — 2,000mg remaining of 3,000mg daily max" },
  { label: "Kidney / Liver Function", status: "pass", detail: "No renal or hepatic conditions on record" },
  { label: "Pregnancy Status", status: "pass", detail: "Not applicable" },
  { label: "Prescription Restrictions", status: "pass", detail: "OTC painkiller dispensing is unrestricted for this patient" },
]

const painkillerOptions = [
  {
    id: "acetaminophen",
    name: "Acetaminophen (Tylenol)",
    strength: "500mg",
    type: "OTC",
    indication: "General pain, fever",
    slot: 6,
    available: 18,
  },
  {
    id: "ibuprofen",
    name: "Ibuprofen (Advil)",
    strength: "400mg",
    type: "OTC",
    indication: "Inflammation, pain",
    slot: 4,
    available: 15,
  },
  {
    id: "aspirin",
    name: "Aspirin",
    strength: "325mg",
    type: "OTC",
    indication: "Pain, fever, anti-platelet",
    slot: 7,
    available: 30,
  },
]

export default function PainkillerPage() {
  const [painLevel, setPainLevel] = useState([5])
  const [selectedMed, setSelectedMed] = useState("acetaminophen")
  const [eligibility, setEligibility] = useState<EligibilityStatus>("pending")
  const [dispensed, setDispensed] = useState(false)

  const dailyConsumed = 1000
  const dailyMax = 3000

  function runEligibilityCheck() {
    // Simulate eligibility check
    setEligibility("eligible")
  }

  function handleDispense() {
    setDispensed(true)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Painkiller Dispensing Flow</h1>
        <p className="text-muted-foreground">Automated safety-checked dispensing for approved OTC pain medications.</p>
      </div>

      {/* Patient eligibility banner */}
      <Card>
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
              <Scale className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Weight</p>
              <p className="font-medium">{currentPatient.weight} kg</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Heart className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Blood Type</p>
              <p className="font-medium">{currentPatient.bloodType}</p>
            </div>
          </div>
          <div className="ml-auto">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="mr-1 size-3" />
              Profile Verified
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Intake form */}
        <div className="flex flex-col gap-6">
          {/* Pain assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5" />
                Pain Assessment
              </CardTitle>
              <CardDescription>Rate your current pain level to determine the appropriate medication and dosage.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Current Pain Level</span>
                  <span className="text-2xl font-bold">{painLevel[0]}<span className="text-sm font-normal text-muted-foreground">/10</span></span>
                </div>
                <Slider
                  value={painLevel}
                  onValueChange={setPainLevel}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>No Pain</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>

              {painLevel[0] >= 8 && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <AlertTriangle className="size-4 shrink-0 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-800">
                    Severe pain detected. Automated dispensing is limited. Caregiver approval may be required. <Link href="/caregivers" className="font-medium underline">Notify Caregiver</Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medication selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="size-5" />
                Select Medication
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {painkillerOptions.map((med) => (
                <button
                  key={med.id}
                  onClick={() => setSelectedMed(med.id)}
                  className={cn(
                    "flex items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50",
                    selectedMed === med.id && "border-foreground bg-muted"
                  )}
                >
                  <div className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    selectedMed === med.id ? "bg-foreground text-background" : "bg-muted"
                  )}>
                    <Pill className="size-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{med.name}</p>
                      <Badge variant="outline" className="text-xs">{med.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{med.strength} &bull; {med.indication} &bull; Slot {med.slot}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Available</p>
                    <p className="font-semibold">{med.available}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Daily usage tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5" />
                Daily Dosage Tracker
              </CardTitle>
              <CardDescription>Acetaminophen cumulative intake — resets at midnight.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Daily Consumed</span>
                <span className="font-semibold">{dailyConsumed}mg / {dailyMax}mg</span>
              </div>
              <Progress value={(dailyConsumed / dailyMax) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">{dailyMax - dailyConsumed}mg remaining today before automatic lock engages.</p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Safety checks & dispensing */}
        <div className="flex flex-col gap-6">
          {/* Safety check panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-5" />
                  Automated Safety Checks
                </CardTitle>
                {eligibility === "eligible" && (
                  <Badge className="bg-green-500">All Clear</Badge>
                )}
                {eligibility === "pending" && (
                  <Badge variant="outline">Not Run</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {safetyChecks.map((check) => (
                <div
                  key={check.label}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3",
                    eligibility === "eligible" && check.status === "warning" && "border-amber-200 bg-amber-50",
                    eligibility === "eligible" && check.status === "pass" && "border-green-100 bg-green-50/50",
                  )}
                >
                  {eligibility === "pending" ? (
                    <div className="size-5 shrink-0 rounded-full border-2 border-muted mt-0.5" />
                  ) : check.status === "pass" ? (
                    <CheckCircle className="size-5 shrink-0 text-green-600 mt-0.5" />
                  ) : check.status === "warning" ? (
                    <AlertTriangle className="size-5 shrink-0 text-amber-600 mt-0.5" />
                  ) : (
                    <XCircle className="size-5 shrink-0 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{check.label}</p>
                    {eligibility !== "pending" && (
                      <p className="text-xs text-muted-foreground">{check.detail}</p>
                    )}
                  </div>
                </div>
              ))}

              {eligibility === "pending" && (
                <Button className="mt-2 w-full" onClick={runEligibilityCheck}>
                  <ShieldCheck className="mr-2 size-4" />
                  Run Safety Check
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Dispense action card */}
          {eligibility === "eligible" && !dispensed && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">Ready to Dispense</CardTitle>
                <CardDescription className="text-green-800">
                  All safety conditions are satisfied. Confirm to dispense one tablet of {painkillerOptions.find(m => m.id === selectedMed)?.name}.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="rounded-lg border border-green-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{painkillerOptions.find(m => m.id === selectedMed)?.name}</p>
                      <p className="text-sm text-muted-foreground">{painkillerOptions.find(m => m.id === selectedMed)?.strength} &bull; 1 tablet</p>
                    </div>
                    <Badge className="bg-green-500">Approved</Badge>
                  </div>
                </div>
                <Button size="lg" className="w-full bg-green-700 hover:bg-green-800" onClick={handleDispense}>
                  <Pill className="mr-2 size-4" />
                  Confirm & Dispense Now
                </Button>
                <p className="text-center text-xs text-green-700">
                  <Lock className="mr-1 inline size-3" />
                  Dispensing event will be logged and caregivers notified.
                </p>
              </CardContent>
            </Card>
          )}

          {dispensed && (
            <Card className="border-foreground">
              <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="size-7 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Dispensed Successfully</h3>
                <p className="text-sm text-muted-foreground">
                  1 × {painkillerOptions.find(m => m.id === selectedMed)?.name} {painkillerOptions.find(m => m.id === selectedMed)?.strength} has been dispensed from Slot {painkillerOptions.find(m => m.id === selectedMed)?.slot}.
                </p>
                <p className="text-xs text-muted-foreground">Next eligible dispense in <strong>4 hours</strong>.</p>
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
                  <Button variant="outline" onClick={() => { setDispensed(false); setEligibility("pending") }}>New Request</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dispense history */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="size-5" />
                Today's Dispensing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyUsageHistory.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{item.time}</TableCell>
                      <TableCell>
                        <p className="font-medium">{item.medication}</p>
                        <p className="text-xs text-muted-foreground">{item.dose}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            item.status === "Dispensed" && "bg-green-50 text-green-700 border-green-200",
                            item.status.startsWith("Denied") && "bg-red-50 text-red-700 border-red-200",
                          )}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Clinical note */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex items-start gap-3 py-4">
              <Info className="size-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Safety Notice</p>
                <p className="text-sm text-amber-800">
                  This system only dispenses OTC medications within safe thresholds. Prescription painkillers always require caregiver or physician approval. For severe or persistent pain, <Link href="/symptom-checker" className="font-medium underline">run a symptom check</Link> or contact your doctor.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
