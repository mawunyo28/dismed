"use client"

import { useState } from "react"
import { Activity, Thermometer, Heart, Wind, AlertTriangle, Download, Users, Pill, Info, CheckCircle, ChevronDown, Zap, Clock, FileText } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { symptomHistory } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function SymptomCheckerPage() {
  const [painLevel, setPainLevel] = useState([4])
  const [showAnalysis, setShowAnalysis] = useState(true)

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Symptom Checker</h1>
        <p className="text-muted-foreground">Assess your health symptoms and check for medication conflicts in real-time.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column - Input form */}
        <div className="flex flex-col gap-6">
          {/* Current Vitals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5" />
                Current Vitals
              </CardTitle>
              <CardDescription>Enter your latest biometric data for accurate analysis.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="temp" className="text-xs uppercase text-muted-foreground">Temp (°F)</FieldLabel>
                  <div className="flex items-center gap-2 rounded-lg border p-2">
                    <Thermometer className="size-4 text-muted-foreground" />
                    <Input id="temp" defaultValue="98.4" className="border-0 p-0 shadow-none" />
                  </div>
                </Field>
                <Field>
                  <FieldLabel htmlFor="bp" className="text-xs uppercase text-muted-foreground">BP (mmHg)</FieldLabel>
                  <div className="flex items-center gap-2 rounded-lg border p-2">
                    <Heart className="size-4 text-muted-foreground" />
                    <Input id="bp" defaultValue="118/75" className="border-0 p-0 shadow-none" />
                  </div>
                </Field>
                <Field>
                  <FieldLabel htmlFor="spo2" className="text-xs uppercase text-muted-foreground">SpO2 (%)</FieldLabel>
                  <div className="flex items-center gap-2 rounded-lg border p-2">
                    <Wind className="size-4 text-muted-foreground" />
                    <Input id="spo2" defaultValue="99" className="border-0 p-0 shadow-none" />
                  </div>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="symptom">Primary Symptom</FieldLabel>
                <Input id="symptom" placeholder="e.g. Persistent headache, nausea, joint pain..." />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="duration">Duration</FieldLabel>
                  <div className="flex items-center gap-2 rounded-lg border p-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <Input id="duration" placeholder="e.g. 2 days" className="border-0 p-0 shadow-none" />
                  </div>
                </Field>
                <Field>
                  <FieldLabel htmlFor="severity">Severity</FieldLabel>
                  <Input id="severity" placeholder="Mild / Moderate / Severe" />
                </Field>
              </div>

              {/* Pain scale */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Pain Level Scale</span>
                  <span className="text-sm font-semibold">{painLevel[0]}/10</span>
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
                  <span>Unbearable</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={() => setShowAnalysis(true)}>
                <Zap className="mr-2 size-4" />
                Run AI Health Analysis
              </Button>
            </CardContent>
          </Card>

          {/* Clinical note */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex items-start gap-3 py-4">
              <Info className="size-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Clinical Note:</p>
                <p className="text-sm text-amber-800">
                  This tool is intended for information only. If you are experiencing chest pain, difficulty breathing, or sudden numbness,
                  <Link href="/help" className="ml-1 font-medium underline">call emergency services immediately</Link>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Analysis results */}
        <div className="flex flex-col gap-6">
          {showAnalysis && (
            <>
              {/* Analysis header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Analysis Result #SYM-8821</Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 size-4" />
                      Download PDF
                    </Button>
                  </div>
                  <CardTitle className="text-xl">AI Diagnostic Summary</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {/* Risk level */}
                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-amber-100">
                      <Info className="size-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Moderate Risk</p>
                      <p className="text-sm text-muted-foreground">Based on AI analysis of symptoms and vitals.</p>
                    </div>
                  </div>

                  {/* Detected indicators and recommendations */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 flex items-center gap-1 text-sm font-medium">
                        <Zap className="size-4" /> Detected Indicators
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>&bull; Blood Pressure elevated (Stage 1)</li>
                        <li>&bull; Reported severity does not match vitals</li>
                        <li>&bull; Symptom frequency: Increasing</li>
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 flex items-center gap-1 text-sm font-medium">
                        <CheckCircle className="size-4" /> Recommended Actions
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>&rsaquo; Rest in a quiet room for 30 minutes</li>
                        <li>&rsaquo; Take 1x Acetaminophen (Tylenol)</li>
                        <li>&rsaquo; Schedule follow-up if persisting 4h+</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medication conflict alert */}
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="flex flex-col gap-3 py-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-5 text-amber-600" />
                    <span className="font-semibold text-amber-900">Potential Medication Conflict Detected</span>
                  </div>
                  <p className="text-sm text-amber-800">
                    The reported symptom &quot;Severe Dizziness&quot; may be a side effect of your current medication <strong>Lisinopril (10mg)</strong>. Please monitor your blood pressure closely.
                  </p>
                  <Link href="/medications" className="text-sm font-medium text-amber-700 hover:underline">
                    View Medication Details
                  </Link>
                </CardContent>
              </Card>

              {/* Technical details accordion */}
              <Accordion type="single" collapsible className="rounded-lg border bg-card">
                <AccordionItem value="details" className="border-none px-4">
                  <AccordionTrigger className="hover:no-underline">
                    Technical Analysis Details
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    <p>
                      Neural network evaluation suggests a 68% probability of tension-related migraine exacerbated by mild hypertension. The correlation with Lisinopril suggests a known vasodilation side effect. Confidence score: 0.92.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Users className="mr-2 size-4" />
                  Forward to Caregiver
                </Button>
                <Button className="flex-1">
                  <Pill className="mr-2 size-4" />
                  Request Painkiller Dispense
                </Button>
              </div>
            </>
          )}

          {/* Assessment History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5" />
                  Assessment History
                </CardTitle>
                <Button variant="link" size="sm">View Full Log</Button>
              </div>
              <CardDescription>Track your symptoms over the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Primary Symptom</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Risk Outcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {symptomHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">{item.date}</TableCell>
                      <TableCell className="font-medium">{item.primarySymptom}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.severity}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-medium",
                          item.riskOutcome === "low" && "text-green-600",
                          item.riskOutcome === "medium" && "text-amber-600",
                          item.riskOutcome === "high" && "text-red-600"
                        )}>
                          {item.riskOutcome === "high" && "* "}{item.riskOutcome}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="flex items-center gap-3 py-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <Activity className="size-5" />
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Avg. Severity Index</p>
                  <p className="text-xl font-bold">2.4 <span className="text-sm font-normal text-muted-foreground">(-0.5 vs last week)</span></p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 py-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Active Conflicts</p>
                  <p className="text-xl font-bold">1 <span className="text-sm font-normal text-muted-foreground">(Monitoring)</span></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
