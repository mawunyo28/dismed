"use client"

import { useState } from "react"
import {
  Activity, Thermometer, Heart, AlertTriangle, Download,
  Users, Pill, Info, CheckCircle, Zap, Clock, Loader2
} from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"

// ── Types matching gemini.ts response shape ───────────────────────────────────

interface DetectedIndicator {
  indicator: string
  status: string
  recommended_action: string
}

interface TechnicalAnalysis {
  clinical_reasoning: string
  differential_considerations: string[]
}

interface AnalysisResult {
  detected_indicators: DetectedIndicator[]
  risk_level: string        // e.g. "Low" | "Moderate" | "Severe" | "Critical"
  technical_analysis: TechnicalAnalysis
  certainty_score: string
  disclaimer: string
}

// ── Risk-level → colour mapping ───────────────────────────────────────────────

function riskColour(level: string) {
  const l = level?.toLowerCase()
  if (l === "low")      return { bg: "bg-green-100",  icon: "text-green-600",  text: "text-green-700"  }
  if (l === "moderate") return { bg: "bg-amber-100",  icon: "text-amber-600",  text: "text-amber-700"  }
  if (l === "severe")   return { bg: "bg-orange-100", icon: "text-orange-600", text: "text-orange-700" }
  if (l === "critical") return { bg: "bg-red-100",    icon: "text-red-600",    text: "text-red-700"    }
  return                       { bg: "bg-muted",       icon: "text-muted-foreground", text: "text-foreground" }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SymptomCheckerPage() {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [painLevel,      setPainLevel]      = useState([4])
  const [temperature,    setTemperature]    = useState("37")
  const [bp,             setBp]             = useState("118/75")
  const [primarySymptom, setPrimarySymptom] = useState("")
  const [duration,       setDuration]       = useState("")
  const [severity,       setSeverity]       = useState("")
  const [description,    setDescription]    = useState("")

  // ── UI / result state ───────────────────────────────────────────────────────
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [analysis,     setAnalysis]     = useState<AnalysisResult | null>(null)

  // ── Run analysis ────────────────────────────────────────────────────────────
  async function handleRunAnalysis() {
    setError(null)
    setLoading(true)
    setAnalysis(null)

    try {
      const res = await fetch("/api/check-symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          temperature_celsius: parseFloat(temperature) || 37,
          bp,
          primarySymptom,
          duration: parseFloat(duration) || 0,
          severity,
          pain_scale: painLevel[0],
        }),
      })

      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({}))
        throw new Error(msg ?? `Server error ${res.status}`)
      }

      const data: AnalysisResult = await res.json()
      setAnalysis(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  // ── Derived display values ───────────────────────────────────────────────────
  const colours = analysis ? riskColour(analysis.risk_level) : null

  return (
      <div className="flex flex-col gap-6 p-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Symptom Checker</h1>
          <p className="text-muted-foreground">
            Assess your health symptoms and check for medication conflicts in real-time.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Left column – Input form ─────────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="size-5" />
                  Current Vitals
                </CardTitle>
                <CardDescription>Enter your latest biometric data for accurate analysis.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Vitals row */}
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="temp" className="text-xs uppercase text-muted-foreground">
                      Temp (°C)
                    </FieldLabel>
                    <div className="flex items-center gap-2 rounded-lg border p-2">
                      <Thermometer className="size-4 text-muted-foreground" />
                      <Input
                          id="temp"
                          value={temperature}
                          className="border-0 p-0 shadow-none"
                          onChange={(e) => setTemperature(e.target.value)}
                      />
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="bp" className="text-xs uppercase text-muted-foreground">
                      BP (mmHg)
                    </FieldLabel>
                    <div className="flex items-center gap-2 rounded-lg border p-2">
                      <Heart className="size-4 text-muted-foreground" />
                      <Input
                          id="bp"
                          value={bp}
                          className="border-0 p-0 shadow-none"
                          onChange={(e) => setBp(e.target.value)}
                      />
                    </div>
                  </Field>
                </div>

                {/* Primary symptom */}
                <Field>
                  <FieldLabel htmlFor="symptom">Primary Symptom</FieldLabel>
                  <Input
                      id="symptom"
                      placeholder="e.g. Persistent headache, nausea, joint pain…"
                      value={primarySymptom}
                      onChange={(e) => setPrimarySymptom(e.target.value)}
                  />
                </Field>

                {/* Duration + Severity */}
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="duration">Duration (days)</FieldLabel>
                    <div className="flex items-center gap-2 rounded-lg border p-2">
                      <Clock className="size-4 text-muted-foreground" />
                      <Input
                          id="duration"
                          placeholder="e.g. 2"
                          value={duration}
                          className="border-0 p-0 shadow-none"
                          onChange={(e) => setDuration(e.target.value)}
                      />
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="severity">Severity</FieldLabel>
                    <Input
                        id="severity"
                        placeholder="Mild / Moderate / Severe"
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                    />
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

                {/* Description */}
                <Textarea
                    placeholder="Describe your symptoms in more detail…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                {/* Submit */}
                <Button
                    className="w-full"
                    size="lg"
                    disabled={loading}
                    onClick={handleRunAnalysis}
                >
                  {loading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Analysing…
                      </>
                  ) : (
                      <>
                        <Zap className="mr-2 size-4" />
                        Run AI Health Analysis
                      </>
                  )}
                </Button>

                {/* API error */}
                {error && (
                    <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                      {error}
                    </p>
                )}
              </CardContent>
            </Card>

            {/* Clinical note */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex items-start gap-3 py-4">
                <Info className="size-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">Clinical Note:</p>
                  <p className="text-sm text-amber-800">
                    This tool is intended for information only. If you are experiencing chest pain,
                    difficulty breathing, or sudden numbness,{" "}
                    <Link href="/help" className="font-medium underline">
                      call emergency services immediately
                    </Link>
                    .
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right column – Results ────────────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Idle state */}
            {!analysis && !loading && (
                <Card className="flex items-center justify-center py-16 text-center">
                  <CardContent>
                    <Zap className="mx-auto mb-3 size-10 text-muted-foreground/40" />
                    <p className="font-medium text-muted-foreground">No analysis yet</p>
                    <p className="text-sm text-muted-foreground/70">
                      Fill in your vitals and symptoms, then click &ldquo;Run AI Health Analysis&rdquo;.
                    </p>
                  </CardContent>
                </Card>
            )}

            {/* Loading skeleton */}
            {loading && (
                <Card className="flex items-center justify-center py-16">
                  <CardContent className="flex flex-col items-center gap-3">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Running AI analysis…</p>
                  </CardContent>
                </Card>
            )}

            {/* ── Analysis result ─────────────────────────────────────────────── */}
            {analysis && colours && (
                <>
                  {/* Diagnostic summary card */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">Analysis Result</Badge>
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
                        <div className={cn("flex size-10 items-center justify-center rounded-full", colours.bg)}>
                          <AlertTriangle className={cn("size-5", colours.icon)} />
                        </div>
                        <div>
                          <p className={cn("font-semibold", colours.text)}>
                            {analysis.risk_level} Risk
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Confidence: {analysis.certainty_score}
                          </p>
                        </div>
                      </div>

                      {/* Detected indicators + recommended actions */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="mb-2 flex items-center gap-1 text-sm font-medium">
                            <Zap className="size-4" /> Detected Indicators
                          </p>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {analysis.detected_indicators.map((item, i) => (
                                <li key={i}>
                                  &bull; <span className="font-medium text-foreground">{item.indicator}</span>
                                  {item.status ? ` — ${item.status}` : ""}
                                </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="mb-2 flex items-center gap-1 text-sm font-medium">
                            <CheckCircle className="size-4" /> Recommended Actions
                          </p>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {analysis.detected_indicators.map((item, i) => (
                                <li key={i}>&rsaquo; {item.recommended_action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Technical analysis accordion */}
                  <Accordion type="single" collapsible className="rounded-lg border bg-card">
                    <AccordionItem value="details" className="border-none px-4">
                      <AccordionTrigger className="hover:no-underline">
                        Technical Analysis Details
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                        <p>{analysis.technical_analysis.clinical_reasoning}</p>
                        {analysis.technical_analysis.differential_considerations.length > 0 && (
                            <div>
                              <p className="mb-1 font-medium text-foreground">Differential considerations:</p>
                              <ul className="space-y-1">
                                {analysis.technical_analysis.differential_considerations.map((d, i) => (
                                    <li key={i}>&bull; {d}</li>
                                ))}
                              </ul>
                            </div>
                        )}
                        <p className="mt-2 rounded-md bg-muted px-3 py-2 text-xs">
                          {analysis.disclaimer}
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

            {/* Assessment history */}
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
                      <TableHead>Date &amp; Time</TableHead>
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
                            item.riskOutcome === "low"    && "text-green-600",
                            item.riskOutcome === "medium" && "text-amber-600",
                            item.riskOutcome === "high"   && "text-red-600",
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
                    <p className="text-xl font-bold">
                      2.4 <span className="text-sm font-normal text-muted-foreground">(-0.5 vs last week)</span>
                    </p>
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
                    <p className="text-xl font-bold">
                      1 <span className="text-sm font-normal text-muted-foreground">(Monitoring)</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
  )
}