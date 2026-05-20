"use client"

import { useState } from "react"
import { HelpCircle, Search, Settings, AlertTriangle, Shield, ChevronRight, MessageCircle, Phone, Mail, ExternalLink, BookOpen, Settings2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { faqItems, helpCategories } from "@/lib/mock-data"

const iconMap: Record<string, React.ElementType> = {
  settings: Settings,
  "alert-triangle": AlertTriangle,
  "settings-2": Settings2,
  shield: Shield,
}

const contactOptions = [
  {
    icon: MessageCircle,
    label: "Live Chat",
    description: "Instant support from our clinical team",
    action: "Start Chat",
    badge: "Available",
    badgeColor: "bg-green-50 text-green-700 border-green-200",
  },
  {
    icon: Phone,
    label: "Phone Support",
    description: "(800) 555-PILL · Mon–Fri 8AM–8PM",
    action: "Call Now",
    badge: "Open",
    badgeColor: "bg-green-50 text-green-700 border-green-200",
  },
  {
    icon: Mail,
    label: "Email Support",
    description: "support@smartpilldispenser.com",
    action: "Send Email",
    badge: "24–48h",
    badgeColor: "bg-muted text-muted-foreground",
  },
]

const quickLinks = [
  { label: "How to pair a new device", href: "#" },
  { label: "Adding a prescription medication", href: "#" },
  { label: "Setting up caregiver access", href: "#" },
  { label: "Understanding missed dose alerts", href: "#" },
  { label: "Voice health scan — troubleshooting mic", href: "#" },
  { label: "Exporting health data for your doctor", href: "#" },
]

export default function HelpPage() {
  const [search, setSearch] = useState("")

  const filteredFAQs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground">Find answers, troubleshoot issues, and get in touch with our support team.</p>
      </div>

      {/* Search bar */}
      <Card>
        <CardContent className="py-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search FAQs and help articles…"
              className="pl-9 text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Help categories */}
          {!search && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Browse Topics</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {helpCategories.map((cat) => {
                  const Icon = iconMap[cat.icon] ?? HelpCircle
                  return (
                    <button
                      key={cat.title}
                      className="flex items-start gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Icon className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{cat.title}</p>
                          <Badge variant="outline" className="text-xs">{cat.articleCount} articles</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                      </div>
                      <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* FAQ accordion */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">
              {search ? `Results for "${search}"` : "Frequently Asked Questions"}
            </h2>

            {filteredFAQs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                  <HelpCircle className="size-10 text-muted-foreground" />
                  <p className="font-medium">No results found</p>
                  <p className="text-sm text-muted-foreground">Try a different search term, or contact our support team below.</p>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="rounded-lg border bg-card">
                {filteredFAQs.map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-none px-4 last:border-0">
                    <AccordionTrigger className="hover:no-underline text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          {/* Quick links */}
          {!search && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5" />
                  Popular Articles
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                {quickLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    {link.label}
                    <ExternalLink className="ml-auto size-3 text-muted-foreground" />
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">
          {/* Contact options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="size-5" />
                Contact Support
              </CardTitle>
              <CardDescription>Couldn't find what you needed? Reach our team directly.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {contactOptions.map((opt) => (
                <div key={opt.label} className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <opt.icon className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{opt.label}</p>
                      <Badge variant="outline" className={`text-xs ${opt.badgeColor}`}>{opt.badge}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">
                    {opt.action}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Emergency info */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex flex-col gap-3 py-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-red-600" />
                <p className="font-semibold text-red-900">Medical Emergency?</p>
              </div>
              <p className="text-sm text-red-800">
                If you are experiencing a medical emergency, do not use this help center. Call emergency services immediately.
              </p>
              <Button variant="destructive" className="w-full">
                <Phone className="mr-2 size-4" />
                Call 911 Now
              </Button>
            </CardContent>
          </Card>

          {/* Device docs */}
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <BookOpen className="size-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Device Manual (PDF)</p>
                <p className="text-xs text-muted-foreground">Full hardware guide for SPD series</p>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-1 size-3" />
                Download
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
