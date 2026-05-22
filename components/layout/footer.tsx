import Link from "next/link"
import { Activity } from "lucide-react"

const footerLinks = {
  platform: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Medications", href: "/medications" },
    { label: "Dispenser Control", href: "/dispenser" },
    { label: "IoT Devices", href: "/devices" },
  ],
  healthServices: [
    { label: "Symptom Checker", href: "/symptom-checker" },
    { label: "Schedules", href: "/schedules" },
    { label: "Notifications", href: "/notifications" },
    { label: "Caregiver Support", href: "/caregivers" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Emergency Resources", href: "/help" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
}

export function Footer() {
  return (
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
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Health Services</h3>
            <ul className="space-y-2">
              {footerLinks.healthServices.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Smart Pill Dispenser Portal. Secure Health Management.
        </div>
      </div>
    </footer>
  )
}
