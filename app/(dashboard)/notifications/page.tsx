"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle, Bell, Check, CheckCircle, Clock, HardDrive,
  Loader2, Pill, RefreshCw, Settings, Trash2, X,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "missed_dose" | "low_stock" | "device" | "caregiver" | "general"
type Priority = "high" | "medium" | "low"
type StatusFilter = "all" | "unread" | "read"
type CategoryFilter = "all" | Category

interface NotificationRow {
  id: string
  title: string
  body: string | null
  category: Category | null
  read: boolean
  created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(iso).toLocaleDateString()
}

function priority(n: NotificationRow): Priority {
  const text = `${n.category} ${n.title}`.toLowerCase()
  if (text.includes("missed") || text.includes("jammed") || text.includes("emergency")) return "high"
  if (text.includes("low_stock") || text.includes("offline") || text.includes("warning")) return "medium"
  return "low"
}

const CATEGORY_META: Record<Category | "general", { label: string; Icon: React.ElementType; tone: string }> = {
  missed_dose: { label: "Missed Dose",  Icon: AlertTriangle, tone: "bg-red-100 text-red-700"       },
  low_stock:   { label: "Low Stock",    Icon: Pill,          tone: "bg-amber-100 text-amber-700"    },
  device:      { label: "Device",       Icon: HardDrive,     tone: "bg-sky-100 text-sky-700"        },
  caregiver:   { label: "Caregiver",    Icon: Bell,          tone: "bg-violet-100 text-violet-700"  },
  general:     { label: "General",      Icon: Settings,      tone: "bg-muted text-muted-foreground" },
}

const PRIORITY_BADGE: Record<Priority, string> = {
  high:   "border-red-300 bg-red-50 text-red-700",
  medium: "border-amber-300 bg-amber-50 text-amber-700",
  low:    "border-border bg-background text-muted-foreground",
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const supabase = useMemo(() => createClient(), [])

  const [items, setItems] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [userId, setUserId] = useState<string | null>(null)

  // Notification preferences (persisted in localStorage for now)
  const [quietHours, setQuietHours] = useState(true)
  const [caregiverEscalation, setCaregiverEscalation] = useState(true)

  // ── Load ────────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setUserId(user.id)

    const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, category, read, created_at")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100)

    if (error) {
      toast.error("Failed to load notifications: " + error.message)
    } else {
      setItems((data ?? []) as NotificationRow[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  // ── Real-time subscription ──────────────────────────────────────────────────

  useEffect(() => {
    if (!userId) return
    const channel = supabase
        .channel(`notifs:${userId}`)
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `owner_id=eq.${userId}`,
        }, (payload) => {
          const row = payload.new as NotificationRow
          setItems(prev => [row, ...prev])
          const meta = CATEGORY_META[row.category ?? "general"]
          toast(row.title, { description: row.body ?? undefined, icon: <meta.Icon className="size-4" /> })
        })
        .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  // ── Actions ─────────────────────────────────────────────────────────────────

  const markRead = async (id: string, read: boolean) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read } : n))
    await supabase.from("notifications").update({ read }).eq("id", id)
  }

  const dismiss = async (id: string) => {
    setItems(prev => prev.filter(n => n.id !== id))
    await supabase.from("notifications").delete().eq("id", id)
  }

  const markAllRead = async () => {
    if (!userId) return
    const unreadIds = items.filter(n => !n.read).map(n => n.id)
    if (!unreadIds.length) return
    setItems(prev => prev.map(n => ({ ...n, read: true })))
    await supabase.from("notifications").update({ read: true }).eq("owner_id", userId).in("id", unreadIds)
    toast.success("All notifications marked as read")
  }

  const clearAll = async () => {
    if (!userId) return
    setItems([])
    await supabase.from("notifications").delete().eq("owner_id", userId)
    toast.success("All notifications cleared")
  }

  // ── Filter ──────────────────────────────────────────────────────────────────

  const filtered = items.filter(n => {
    if (statusFilter === "unread" && n.read) return false
    if (statusFilter === "read"   && !n.read) return false
    if (categoryFilter !== "all" && n.category !== categoryFilter) return false
    return true
  })

  const unreadCount = items.filter(n => !n.read).length
  const highCount   = items.filter(n => priority(n) === "high").length

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              Alerts from your dispenser, updated in real-time.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />
              Refresh
            </Button>
            {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllRead}>
                  <CheckCircle className="mr-2 size-4" />
                  Mark all read
                </Button>
            )}
            {items.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearAll}>
                  <Trash2 className="mr-2 size-4 text-red-500" />
                  Clear all
                </Button>
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                <Bell className="size-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">{highCount}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-red-100">
                <AlertTriangle className="size-5 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <CheckCircle className="size-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main list */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={v => setCategoryFilter(v as CategoryFilter)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="missed_dose">Missed Dose</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="device">Device</SelectItem>
                  <SelectItem value="caregiver">Caregiver</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>

              {(statusFilter !== "all" || categoryFilter !== "all") && (
                  <Button variant="ghost" size="sm" onClick={() => { setStatusFilter("all"); setCategoryFilter("all") }}>
                    <X className="mr-1.5 size-3.5" /> Clear filters
                  </Button>
              )}

              <span className="ml-auto text-sm text-muted-foreground">
              {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
            </span>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
            ) : filtered.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                    <Bell className="size-10 text-muted-foreground/40" />
                    <p className="font-medium">No notifications</p>
                    <p className="text-sm text-muted-foreground">
                      {items.length > 0
                          ? "No notifications match these filters."
                          : "Your dispenser hasn't sent any alerts yet."}
                    </p>
                  </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col gap-3">
                  {filtered.map(n => {
                    const cat = n.category ?? "general"
                    const meta = CATEGORY_META[cat]
                    const prio = priority(n)
                    return (
                        <Card
                            key={n.id}
                            className={cn(
                                "transition-colors",
                                !n.read && prio === "high"   && "border-red-300 bg-red-50/60",
                                !n.read && prio === "medium" && "border-amber-200 bg-amber-50/40",
                                !n.read && prio === "low"    && "border-primary/30 bg-primary/5",
                            )}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg", meta.tone)}>
                                <meta.Icon className="size-4" />
                              </div>

                              {/* Body */}
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium leading-tight">{n.title}</p>
                                    {!n.read && <span className="size-2 rounded-full bg-primary shrink-0" />}
                                  </div>
                                  {/* Dismiss */}
                                  <button
                                      onClick={() => dismiss(n.id)}
                                      className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <X className="size-3.5" />
                                  </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                  <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                                  <Badge variant="outline" className={cn("capitalize text-[10px]", PRIORITY_BADGE[prio])}>
                                    {prio}
                                  </Badge>
                                  <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                                    {relativeTime(n.created_at)}
                            </span>
                                </div>

                                {n.body && (
                                    <p className="text-sm text-muted-foreground">{n.body}</p>
                                )}

                                <div className="flex gap-2 pt-1">
                                  <Button
                                      size="sm"
                                      variant={n.read ? "outline" : "default"}
                                      onClick={() => markRead(n.id, !n.read)}
                                      className="h-7 px-3 text-xs"
                                  >
                                    <Check className="mr-1.5 size-3" />
                                    {n.read ? "Mark unread" : "Acknowledge"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                    )
                  })}
                </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alert Preferences</CardTitle>
                <CardDescription>Control how the portal handles incoming alerts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Missed dose */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Missed dose alerts</p>
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Bell className="size-3.5" /> In-app
                  </span>
                    <Switch defaultChecked />
                  </div>
                </div>

                {/* Low stock */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Low stock warnings</p>
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Bell className="size-3.5" /> In-app
                  </span>
                    <Switch defaultChecked />
                  </div>
                </div>

                {/* Device offline */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Device offline alerts</p>
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Bell className="size-3.5" /> In-app
                  </span>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Caregiver escalation</p>
                      <p className="text-xs text-muted-foreground">Notify linked caregivers for unread critical alerts.</p>
                    </div>
                    <Switch checked={caregiverEscalation} onCheckedChange={setCaregiverEscalation} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Quiet hours</p>
                      <p className="text-xs text-muted-foreground">Suppress low-priority alerts 10PM–7AM.</p>
                    </div>
                    <Switch checked={quietHours} onCheckedChange={setQuietHours} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[Category]][]).map(([key, meta]) => {
                  const count = items.filter(n => (n.category ?? "general") === key).length
                  return (
                      <button
                          key={key}
                          onClick={() => setCategoryFilter(categoryFilter === key ? "all" : key)}
                          className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              categoryFilter === key ? "bg-muted font-medium" : "hover:bg-muted/50"
                          )}
                      >
                        <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", meta.tone)}>
                          <meta.Icon className="size-3.5" />
                        </div>
                        <span className="flex-1 text-left">{meta.label}</span>
                        <span className="text-xs text-muted-foreground">{count}</span>
                      </button>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}