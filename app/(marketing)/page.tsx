import Link from "next/link"
import { Activity, ArrowRight, Check, Shield, Mic, Smartphone, Users, Zap, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Smartphone,
    title: "Remote Dispenser Control",
    description: "Monitor and manage pill compartments, adjust schedules, and manually override settings from anywhere in the world via our secure app.",
  },
  {
    icon: Mic,
    title: "Voice Health Analysis",
    description: "Our built-in AI analyzes vocal patterns to detect early signs of respiratory issues, fatigue, or dehydration before they become critical.",
  },
  {
    icon: Users,
    title: "Caregiver Integration",
    description: "Instantly notify family members or clinicians of missed doses or abnormal health readings, ensuring a rapid safety net.",
  },
  {
    icon: Activity,
    title: "Symptom & Pain Management",
    description: "Track daily symptoms and utilize our intelligent protocol for safe, automated painkiller dispensing within strict safety limits.",
  },
  {
    icon: Zap,
    title: "Smart Adherence Tracking",
    description: "Automated logs and analytics provide a complete picture of medication adherence for your next doctor's visit.",
  },
  {
    icon: Shield,
    title: "Military-Grade Privacy",
    description: "Your health data is encrypted and managed according to global healthcare privacy standards, ensuring your information stays yours.",
  },
]

const steps = [
  {
    number: "01",
    title: "Connect Your Device",
    description: "Sync your Smart Dispenser to your home WiFi via the mobile-friendly portal. Secure pairing takes less than 60 seconds.",
  },
  {
    number: "02",
    title: "Configure Schedules",
    description: "Input your prescriptions or scan pill bottles to automatically generate dispensing rules, including dosage limits.",
  },
  {
    number: "03",
    title: "Invite Caregivers",
    description: "Link your healthcare team or family to receive real-time notifications and shared access to health reports.",
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-foreground">
              <Activity className="size-4 text-background" />
            </div>
            <span className="font-semibold">Smart Pill Dispenser Portal</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero section */}
        <section className="border-b bg-gradient-to-b from-muted/50 to-background py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="flex flex-col gap-6">
                <Badge variant="outline" className="w-fit gap-1 border-green-300 bg-green-50 text-green-700">
                  <Check className="size-3" />
                  FDA Compliant & Secure
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
                  Never Miss a Dose Again.
                </h1>
                <p className="text-lg text-muted-foreground text-pretty">
                  The only intelligent medication management system that combines automatic dispensing with AI-driven health monitoring and real-time caregiver alerts.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" asChild>
                    <Link href="/signup">
                      Get Started Now
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#features">How it Works</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Check className="size-4 text-green-600" />
                    Zero setup fees
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-4 text-green-600" />
                    24/7 Support
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-muted/50 p-8">
                  <div className="flex h-full flex-col items-center justify-center rounded-xl border bg-background p-6 shadow-lg">
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
                      <Activity className="size-8 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Morning Dose</p>
                    <p className="text-lg font-semibold text-green-600">Successfully Taken</p>
                    <div className="mt-6 w-full rounded-lg border bg-muted/50 p-4 text-center">
                      <p className="text-xs text-muted-foreground">Next Dispense</p>
                      <p className="text-lg font-medium">12:30 PM (Metformin)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="border-b py-8">
          <div className="mx-auto max-w-7xl px-6">
            <p className="mb-6 text-center text-sm text-muted-foreground uppercase tracking-wide">
              Trusted by Leading Health Providers
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <Activity className="size-6" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Comprehensive Care for Better Living
              </h2>
              <p className="mt-4 text-muted-foreground">
                Our platform goes beyond just a dispenser. We provide a full-spectrum health ecosystem designed to simplify complex medication regimens.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="border-muted">
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted">
                      <feature.icon className="size-5" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works section */}
        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="aspect-[4/3] rounded-2xl bg-muted/50">
                <div className="flex h-full items-center justify-center">
                  <div className="relative w-64 rounded-xl border bg-background p-6 shadow-lg">
                    <div className="absolute -left-3 -top-3 flex size-8 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background">
                      1
                    </div>
                    <p className="text-sm text-muted-foreground">Setting up device...</p>
                    <div className="mt-4 h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-3/4 rounded-full bg-foreground" />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Set up in minutes.<br />
                  Peace of mind for years.
                </h2>
                <p className="mt-4 text-muted-foreground">
                  The portal makes onboarding your smart dispenser as simple as connecting a new smartphone.
                </p>
                <div className="mt-8 flex flex-col gap-6">
                  {steps.map((step) => (
                    <div key={step.number} className="flex gap-4">
                      <span className="text-2xl font-bold text-muted-foreground">{step.number}</span>
                      <div>
                        <h3 className="font-semibold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="border-t py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Users className="size-6" />
              </div>
            </div>
            <blockquote className="text-xl font-medium italic text-balance">
              &ldquo;The Smart Pill Dispenser Portal has fundamentally changed how I care for my elderly father. I no longer worry if he&apos;s taken his heart medication while I&apos;m at work. The notifications give me the peace of mind I&apos;ve been searching for.&rdquo;
            </blockquote>
            <div className="mt-6">
              <p className="font-semibold">Sarah Jenkins</p>
              <p className="text-sm text-muted-foreground">Family Caregiver, New York</p>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="bg-foreground py-16 text-background">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to automate your health?
            </h2>
            <p className="mt-4 text-background/80">
              Join thousands of families ensuring safe, timely medication delivery every single day.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">Create Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-background/20 text-background hover:bg-background/10" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-foreground">
                  <Activity className="size-4 text-background" />
                </div>
                <span className="font-semibold">Smart Pill Dispenser Portal</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Revolutionizing medication adherence through smart technology and real-time health monitoring.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">Platform</h3>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
                <li><Link href="/medications" className="hover:text-foreground">Medications</Link></li>
                <li><Link href="/dispenser" className="hover:text-foreground">Dispenser Control</Link></li>
                <li><Link href="/devices" className="hover:text-foreground">IoT Devices</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">Health Services</h3>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li><Link href="/symptom-checker" className="hover:text-foreground">Symptom Checker</Link></li>
                <li><Link href="/voice-health" className="hover:text-foreground">Voice Analysis</Link></li>
                <li><Link href="/painkiller" className="hover:text-foreground">Painkiller Flow</Link></li>
                <li><Link href="/caregivers" className="hover:text-foreground">Caregiver Support</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">Support</h3>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="/help" className="hover:text-foreground">Emergency Resources</Link></li>
                <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Smart Pill Dispenser Portal. Secure Health Management.
          </div>
        </div>
      </footer>
    </div>
  )
}
