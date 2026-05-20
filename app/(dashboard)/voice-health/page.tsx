"use client"

import { Mic, Play, Clock, Settings, Download, Share2, Info, CheckCircle, AlertTriangle, Volume2, Droplet, Wind } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts"
import { voiceScans, fatigueTrend } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const chartConfig = {
  value: {
    label: "Fatigue Index (%)",
    color: "hsl(var(--foreground))",
  },
}

export default function VoiceHealthPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Voice Health Analysis</h1>
          <p className="text-muted-foreground">Monitor vocal biomarkers to track respiratory health and fatigue levels.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 bg-green-50 text-green-700">
            <span className="size-2 rounded-full bg-green-500" />
            Mic Calibrated
          </Badge>
          <Button variant="outline" size="icon">
            <Settings className="size-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Scan results card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">Scan Complete</Badge>
                  <span className="text-sm text-muted-foreground">Today at 2:14 PM</span>
                </div>
                <Button variant="outline" size="sm">
                  <Mic className="mr-2 size-4" />
                  New Scan
                </Button>
              </div>
              <CardTitle className="text-xl">Health Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Clinical summary */}
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Info className="size-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Clinical Summary</p>
                  <p className="text-sm text-muted-foreground">
                    Vocal biomarkers indicate mild fatigue levels, likely due to recent activity. Hoarseness and respiratory rates are within normal ranges. We suggest maintaining hydration. No conflicts with current medications detected.
                  </p>
                </div>
              </div>

              {/* Health metrics grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Hoarseness Score</span>
                      </div>
                      <span className="font-semibold text-green-600">12%</span>
                    </div>
                    <Progress value={12} className="mt-2 h-2 [&>div]:bg-green-500" />
                    <p className="mt-2 text-xs text-muted-foreground">Lower is better. Measures vocal fold irregularity.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Fatigue Index</span>
                      </div>
                      <span className="font-semibold text-amber-600">42%</span>
                    </div>
                    <Progress value={42} className="mt-2 h-2 [&>div]:bg-amber-500" />
                    <p className="mt-2 text-xs text-muted-foreground">Derived from spectral tilt and energy fluctuations.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplet className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Dehydration Risk</span>
                      </div>
                      <span className="font-semibold text-green-600">18%</span>
                    </div>
                    <Progress value={18} className="mt-2 h-2 [&>div]:bg-green-500" />
                    <p className="mt-2 text-xs text-muted-foreground">Detects micro-fluctuations linked to vocal cord moisture.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wind className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Respiratory Load</span>
                      </div>
                      <span className="font-semibold text-green-600">25%</span>
                    </div>
                    <Progress value={25} className="mt-2 h-2 [&>div]:bg-green-500" />
                    <p className="mt-2 text-xs text-muted-foreground">Based on speech rate and breath-pause intervals.</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Fatigue Trend */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-5" />
                  7-Day Fatigue Trend
                </CardTitle>
                <Badge variant="outline">Target: Below 30%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fatigueTrend}>
                    <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[0, 40]} />
                    <ReferenceLine y={30} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--foreground))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--foreground))", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Action buttons and disclaimers */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="size-4" />
              <span>Not a clinical diagnosis</span>
              <span>&bull;</span>
              <span>Encrypted Data</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Share2 className="mr-2 size-4" />
                Share with Doctor
              </Button>
              <Button>
                <Download className="mr-2 size-4" />
                Save to Health Vault
              </Button>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">
          {/* Recent Scans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5" />
                Recent Scans
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {voiceScans.map((scan) => (
                <div key={scan.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Play className="size-4" />
                  </Button>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{scan.result}</p>
                    <p className="text-xs text-muted-foreground">{scan.date} &bull; {scan.time}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">{scan.duration}</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "ml-2",
                        scan.status === "Success" && "bg-green-100 text-green-700",
                        scan.status === "Warning" && "bg-amber-100 text-amber-700",
                        scan.status === "Info" && "bg-blue-100 text-blue-700"
                      )}
                    >
                      {scan.status}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button variant="link" className="justify-start">View All History &rarr;</Button>
            </CardContent>
          </Card>

          {/* Voice Wellness Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="size-5" />
                Voice Wellness Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-foreground" />
                  Drink 8oz of water 15 minutes before your next voice scan for accuracy.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-foreground" />
                  Avoid whispering; it creates more strain than normal speaking.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-foreground" />
                  Schedule scans at the same time daily to establish a reliable baseline.
                </li>
              </ul>
              <Button variant="link" className="mt-4 justify-start p-0">Read full safety guide &rarr;</Button>
            </CardContent>
          </Card>

          {/* Mic settings */}
          <Card>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Volume2 className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Mic Sensitivity</p>
                  <p className="font-medium">Standard (44.1 kHz)</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
