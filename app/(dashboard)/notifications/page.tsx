"use client"

import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react"
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle,
  Clock,
  Download,
  HardDrive,
  Loader2,
  Mail,
  MessageSquare,
  MoreVertical,
  Pill,
  Search,
  Settings,
  Smartphone,
  Wifi,
  WifiOff,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { notifications as seedNotifications, type NotificationCategory, type NotificationPriority } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type StatusFilter = "all" | "unread" | "read"
type CategoryFilter = "all" | NotificationCategory
type PriorityFilter = "all" | NotificationPriority
type NotificationSource = "supabase" | "mock"
type SyncStatus = "loading" | "live" | "demo" | "error"

interface SupabaseNotificationRow {
  id: string
  owner_id: string
  title: string
  body: string | null
  category: string | null
  read: boolean | null
  created_at: string | null
}

interface NotificationItem {
  id: string
  ownerId?: string
  title: string
  description: string
  category: NotificationCategory
  rawCategory: string
  priority: NotificationPriority
  timestamp: string
  createdAt?: string
  read: boolean
  source: NotificationSource
}

const categoryOptions: CategoryFilter[] = ["all", "Emergency", "Medication", "Device", "System"]
const priorityOptions: PriorityFilter[] = ["all", "high", "medium", "low"]

const categoryIcons: Record<NotificationCategory, ComponentType<{ className?: string }>> = {
  Emergency: AlertTriangle,
  Medication: Pill,
  Device: HardDrive,
  System: Settings,
}

const categoryTone: Record<NotificationCategory, string> = {
  Emergency: "bg-destructive/10 text-destructive",
  Medication: "bg-primary/10 text-primary",
  Device: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  System: "bg-muted text-muted-foreground",
}

const priorityTone: Record<NotificationPriority, string> = {
  high: "border-destructive/40 bg-destructive/5 text-destructive",
  medium: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
  low: "border-border bg-background text-muted-foreground",
}

function relativeTime(iso: string | null) {
  if (!iso) return "Unknown time"

  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)

  if (Number.isNaN(mins)) return "Unknown time"
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`

  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`

  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`

  return new Date(iso).toLocaleDateString()
}

function normalizeCategory(category: string | null): NotificationCategory {
  const value = (category ?? "").toLowerCase()

  if (["emergency", "critical", "missed_dose", "missed-dose"].includes(value)) return "Emergency"
  if (["medication", "low_stock", "low-stock", "refill"].includes(value)) return "Medication"
  if (["device", "offline", "jammed", "hardware"].includes(value)) return "Device"

  return "System"
}

function inferPriority(category: string | null, title: string): NotificationPriority {
  const text = `${category ?? ""} ${title}`.toLowerCase()

  if (text.includes("emergency") || text.includes("critical") || text.includes("missed") || text.includes("jammed")) {
    return "high"
  }
  if (text.includes("low_stock") || text.includes("refill") || text.includes("offline") || text.includes("warning")) {
    return "medium"
  }

  return "low"
}

function mapDatabaseNotification(row: SupabaseNotificationRow): NotificationItem {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    description: row.body ?? "No details provided.",
    category: normalizeCategory(row.category),
    rawCategory: row.category ?? "system",
    priority: inferPriority(row.category, row.title),
    timestamp: relativeTime(row.created_at),
    createdAt: row.created_at ?? undefined,
    read: row.read ?? false,
    source: "supabase",
  }
}

function mapMockNotification(notification: (typeof seedNotifications)[number]): NotificationItem {
  return {
    ...notification,
    rawCategory: notification.category.toLowerCase(),
    source: "mock",
  }
}

export default function NotificationsPage() {
  const supabase = useMemo(() => createClient(), [])

  const [items, setItems] = useState<NotificationItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all")
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading")
  const [syncMessage, setSyncMessage] = useState("Connecting to Supabase notifications.")

  const loadNotifications = useCallback(async () => {
    setSyncStatus("loading")
    setSyncMessage("Connecting to Supabase notifications.")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setItems(seedNotifications.map(mapMockNotification))
      setSyncStatus("demo")
      setSyncMessage("Sign in to view live dispenser notifications from Supabase.")
      return null
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("id, owner_id, title, body, category, read, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      setItems(seedNotifications.map(mapMockNotification))
      setSyncStatus("error")
      setSyncMessage(`Could not load Supabase notifications: ${error.message}`)
      return null
    }

    setItems(((data ?? []) as SupabaseNotificationRow[]).map(mapDatabaseNotification))
    setSyncStatus("live")
    setSyncMessage("Live Supabase dispenser notifications are connected.")

    return user.id
  }, [supabase])

  useEffect(() => {
    let active = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    loadNotifications().then((ownerId) => {
      if (!active || !ownerId) return

      channel = supabase
        .channel(`notifications:${ownerId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `owner_id=eq.${ownerId}`,
          },
          (payload) => {
            const row = payload.new as SupabaseNotificationRow
            const notification = mapDatabaseNotification(row)

            setItems((current) => [notification, ...current.filter((item) => item.id !== notification.id)])
            toast.info(notification.title)
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `owner_id=eq.${ownerId}`,
          },
          (payload) => {
            const row = payload.new as SupabaseNotificationRow
            const notification = mapDatabaseNotification(row)

            setItems((current) => current.map((item) => (item.id === notification.id ? notification : item)))
          },
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setSyncStatus("live")
            setSyncMessage("Live Supabase dispenser notifications are connected.")
          }
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setSyncStatus("error")
            setSyncMessage("Loaded notifications, but the realtime subscription is not connected.")
          }
        })
    })

    return () => {
      active = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [loadNotifications, supabase])

  const stats = useMemo(() => {
    const unread = items.filter((item) => !item.read).length
    const critical = items.filter((item) => item.priority === "high" && !item.read).length
    const device = items.filter((item) => item.category === "Device" && !item.read).length

    return { unread, critical, device, total: items.length }
  }, [items])

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return items.filter((item) => {
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.rawCategory.toLowerCase().includes(query) ||
        item.priority.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "unread" && !item.read) ||
        (statusFilter === "read" && item.read)

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
      const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter

      return matchesQuery && matchesStatus && matchesCategory && matchesPriority
    })
  }, [categoryFilter, items, priorityFilter, searchQuery, statusFilter])

  const hasActiveFilters =
    searchQuery.length > 0 || statusFilter !== "all" || categoryFilter !== "all" || priorityFilter !== "all"

  const updateReadState = async (id: string, read: boolean) => {
    const target = items.find((item) => item.id === id)
    if (!target) return

    setItems((current) => current.map((item) => (item.id === id ? { ...item, read } : item)))

    if (target.source !== "supabase") return

    const { error } = await supabase.from("notifications").update({ read }).eq("id", id)
    if (error) {
      setItems((current) => current.map((item) => (item.id === id ? { ...item, read: target.read } : item)))
      toast.error(`Failed to update notification: ${error.message}`)
    }
  }

  const markAllRead = async () => {
    const unreadSupabaseIds = items
      .filter((item) => item.source === "supabase" && !item.read)
      .map((item) => item.id)

    setItems((current) => current.map((item) => ({ ...item, read: true })))

    if (unreadSupabaseIds.length === 0) return

    const { error } = await supabase.from("notifications").update({ read: true }).in("id", unreadSupabaseIds)
    if (error) {
      toast.error(`Failed to mark all read: ${error.message}`)
      loadNotifications()
    }
  }

  const toggleRead = (id: string) => {
    const target = items.find((item) => item.id === id)
    if (!target) return

    updateReadState(id, !target.read)
  }

  const dismissNotification = async (id: string) => {
    const target = items.find((item) => item.id === id)
    if (!target) return

    setItems((current) => current.filter((item) => item.id !== id))

    if (target.source !== "supabase" || target.read) return

    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id)
    if (error) toast.error(`Notification hidden locally, but Supabase was not updated: ${error.message}`)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setCategoryFilter("all")
    setPriorityFilter("all")
  }

  const exportLog = () => {
    const rows = [
      ["ID", "Title", "Category", "Raw Category", "Priority", "Status", "Timestamp", "Source", "Description"],
      ...items.map((item) => [
        item.id,
        item.title,
        item.category,
        item.rawCategory,
        item.priority,
        item.read ? "Read" : "Unread",
        item.createdAt ?? item.timestamp,
        item.source,
        item.description,
      ]),
    ]

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = "notification-log.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
            {stats.unread > 0 && <Badge variant="secondary">{stats.unread} unread</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            Triage medication, device, and system alerts from Supabase.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={markAllRead} disabled={stats.unread === 0}>
            <Check className="size-4" />
            Mark all read
          </Button>
          <Button variant="outline" onClick={exportLog} disabled={items.length === 0}>
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "flex items-start gap-2 rounded-md border p-3 text-sm",
          syncStatus === "live" && "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
          syncStatus === "demo" && "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
          syncStatus === "error" && "border-destructive/30 bg-destructive/5 text-destructive",
        )}
      >
        {syncStatus === "loading" && <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin" />}
        {syncStatus === "live" && <Wifi className="mt-0.5 size-4 shrink-0" />}
        {(syncStatus === "demo" || syncStatus === "error") && <WifiOff className="mt-0.5 size-4 shrink-0" />}
        <span>{syncMessage}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Unread alerts" value={stats.unread} icon={Bell} tone="text-primary" />
        <MetricCard label="Critical open" value={stats.critical} icon={AlertTriangle} tone="text-destructive" />
        <MetricCard label="Device attention" value={stats.device} icon={HardDrive} tone="text-sky-700 dark:text-sky-300" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 xl:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by title, medication, category, or priority"
                    className="pl-9"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:w-[520px]">
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === "all" ? "All categories" : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as PriorityFilter)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority === "all" ? "All priorities" : `${priority[0].toUpperCase()}${priority.slice(1)} priority`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredNotifications.length} of {stats.total} notifications
            </p>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="size-4" />
                Clear filters
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {syncStatus === "loading" && (
              <Card>
                <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading notifications from Supabase.
                </CardContent>
              </Card>
            )}

            {syncStatus !== "loading" &&
              filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onDismiss={dismissNotification}
                  onToggleRead={toggleRead}
                />
              ))}

            {syncStatus !== "loading" && filteredNotifications.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                  <CheckCircle className="size-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium">No notifications match this view</p>
                    <p className="text-sm text-muted-foreground">Adjust the filters or wait for the dispenser to send an alert.</p>
                  </div>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Preferences</CardTitle>
              <CardDescription>Choose the channels used for each alert type.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <PreferenceRow label="Emergency alerts" app sms email critical />
              <PreferenceRow label="Medication reminders" app email />
              <PreferenceRow label="Device status" app email />
              <PreferenceRow label="Weekly summaries" email />
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Caregiver escalation</p>
                    <p className="text-xs text-muted-foreground">Notify linked caregivers for unread critical alerts.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Quiet hours</p>
                    <p className="text-xs text-muted-foreground">Mute low-priority updates overnight.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button className="w-full">Save preferences</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Current notification delivery status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border p-3">
                  <p className="text-2xl font-semibold">98%</p>
                  <p className="text-xs text-muted-foreground">Delivery rate</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-2xl font-semibold">1.2s</p>
                  <p className="text-xs text-muted-foreground">Avg latency</p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle className="mt-0.5 size-4 shrink-0" />
                App, SMS, and email alert systems are operational.
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: ComponentType<{ className?: string }>
  tone: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        <div className={cn("flex size-10 items-center justify-center rounded-md bg-muted", tone)}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  )
}

function NotificationCard({
  notification,
  onDismiss,
  onToggleRead,
}: {
  notification: NotificationItem
  onDismiss: (id: string) => void
  onToggleRead: (id: string) => void
}) {
  const Icon = categoryIcons[notification.category]

  return (
    <Card
      className={cn(
        "transition-colors",
        !notification.read && "border-primary/30 bg-primary/5",
        notification.priority === "high" && !notification.read && "border-destructive/40 bg-destructive/5",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md", categoryTone[notification.category])}>
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-medium leading-tight">{notification.title}</h2>
                  {!notification.read && <span className="size-2 rounded-full bg-primary" aria-label="Unread" />}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{notification.category}</Badge>
                  <Badge variant="outline" className={cn("capitalize", priorityTone[notification.priority])}>
                    {notification.priority}
                  </Badge>
                  {notification.source === "supabase" && <Badge variant="secondary">Supabase</Badge>}
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {notification.timestamp}
                  </span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`Open actions for ${notification.title}`}>
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onToggleRead(notification.id)}>
                    {notification.read ? "Mark unread" : "Mark read"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDismiss(notification.id)}>Hide for now</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-muted-foreground">{notification.description}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant={notification.read ? "outline" : "default"} onClick={() => onToggleRead(notification.id)}>
                <Check className="size-4" />
                {notification.read ? "Reopen" : "Acknowledge"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDismiss(notification.id)}>
                Hide
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PreferenceRow({
  label,
  app = false,
  sms = false,
  email = false,
  critical = false,
}: {
  label: string
  app?: boolean
  sms?: boolean
  email?: boolean
  critical?: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          {critical && <p className="text-xs text-muted-foreground">Critical alerts ignore quiet hours.</p>}
        </div>
        {critical && <Badge variant="destructive">Critical</Badge>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <ChannelToggle label="App" icon={Smartphone} defaultChecked={app} />
        <ChannelToggle label="SMS" icon={MessageSquare} defaultChecked={sms} />
        <ChannelToggle label="Email" icon={Mail} defaultChecked={email} />
      </div>
    </div>
  )
}

function ChannelToggle({
  label,
  icon: Icon,
  defaultChecked,
}: {
  label: string
  icon: ComponentType<{ className?: string }>
  defaultChecked: boolean
}) {
  return (
    <label className="flex items-center justify-between gap-2 rounded-md border p-2">
      <span className="flex items-center gap-1.5 text-xs font-medium">
        <Icon className="size-3.5 text-muted-foreground" />
        {label}
      </span>
      <Switch defaultChecked={defaultChecked} />
    </label>
  )
}
