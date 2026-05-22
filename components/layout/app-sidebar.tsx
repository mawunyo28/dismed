"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Pill,
  Calendar,
  HardDrive,
  Activity,
  Users,
  Shield,
  HelpCircle,
  Settings,
  LogOut,
  Bell,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const mainNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Medications", href: "/medications", icon: Pill },
  { title: "Schedules", href: "/schedules", icon: Calendar },
  { title: "Dispenser", href: "/dispenser", icon: HardDrive },
  { title: "Devices", href: "/devices", icon: HardDrive },
]

const healthNavItems = [
  { title: "Symptom Checker", href: "/symptom-checker", icon: Activity },
]

const socialNavItems = [
  { title: "Caregivers", href: "/caregivers", icon: Users },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Admin", href: "/admin", icon: Shield },
]

const footerNavItems = [
  { title: "Help Center", href: "/help", icon: HelpCircle },
  { title: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-foreground">
            <Activity className="size-4 text-background" />
          </div>
          <span className="text-base font-semibold">Smart Pill Dispenser Portal</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Medication</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href + "/")}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Health</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {healthNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href + "/")}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {socialNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href + "/")}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {footerNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-destructive hover:text-destructive">
              <Link href="/login">
                <LogOut />
                <span>Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
