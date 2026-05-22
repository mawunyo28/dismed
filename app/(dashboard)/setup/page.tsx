"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
    Activity, HardDrive, Pill, Check, ChevronRight,
    Copy, RefreshCw, AlertTriangle, Loader2, ArrowRight,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateKey() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
    return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

// ─── Step types ───────────────────────────────────────────────────────────────

type Step = "welcome" | "device" | "compartments" | "done"

interface CompartmentDraft {
    slot: number
    medication_name: string
    dosage_mg: string
    pill_count: string
    capacity: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SetupPage() {
    const router = useRouter()
    const supabase = createClient()

    const [step, setStep] = useState<Step>("welcome")
    const [isPending, startTransition] = useTransition()

    // Device step
    const [label, setLabel] = useState("")
    const [deviceKey, setDeviceKey] = useState(generateKey)
    const [deviceId, setDeviceId] = useState<string | null>(null)

    // Compartments step
    const [compartments, setCompartments] = useState<CompartmentDraft[]>([
        { slot: 1, medication_name: "", dosage_mg: "", pill_count: "", capacity: "30" },
        { slot: 2, medication_name: "", dosage_mg: "", pill_count: "", capacity: "30" },
        { slot: 3, medication_name: "", dosage_mg: "", pill_count: "", capacity: "30" },
    ])

    const updateComp = (slot: number, field: keyof CompartmentDraft, value: string) =>
        setCompartments(prev => prev.map(c => c.slot === slot ? { ...c, [field]: value } : c))

    const copyKey = () => {
        navigator.clipboard.writeText(deviceKey)
        toast.success("Key copied!")
    }

    // ── Step 1: Create device ────────────────────────────────────────────────────

    const createDevice = () => {
        if (!label.trim()) { toast.error("Please give your device a label"); return }

        startTransition(async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { toast.error("Not signed in"); return }

            const { data, error } = await supabase
                .from("devices")
                .insert({
                    owner_id: user.id,
                    label: label.trim(),
                    device_key: deviceKey,
                    firmware: "v1.0.0",
                    is_online: false,
                })
                .select("id")
                .single()

            if (error) { toast.error(error.message); return }
            setDeviceId(data.id)
            setStep("compartments")
        })
    }

    // ── Step 2: Save compartments ────────────────────────────────────────────────

    const saveCompartments = () => {
        if (!deviceId) return

        startTransition(async () => {
            const filled = compartments.filter(c => c.medication_name.trim())
            if (filled.length === 0) {
                // Skip if none filled, still go to done
                setStep("done")
                return
            }

            const patches = filled.map(c => ({
                device_id: deviceId,
                slot: c.slot,
                medication_name: c.medication_name.trim() || null,
                dosage_mg: c.dosage_mg ? parseFloat(c.dosage_mg) : null,
                pill_count: parseInt(c.pill_count) || 0,
                capacity: parseInt(c.capacity) || 30,
                updated_at: new Date().toISOString(),
            }))

            for (const patch of patches) {
                const { error } = await supabase
                    .from("compartments")
                    .update(patch)
                    .eq("device_id", deviceId)
                    .eq("slot", patch.slot)
                if (error) { toast.error(error.message); return }
            }

            setStep("done")
        })
    }

    // ─── Progress bar ────────────────────────────────────────────────────────────

    const STEPS: { id: Step; label: string }[] = [
        { id: "device",       label: "Device"       },
        { id: "compartments", label: "Compartments" },
        { id: "done",         label: "Done"         },
    ]

    const stepIndex = STEPS.findIndex(s => s.id === step)

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
            {/* Logo */}
            <div className="mb-8 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-foreground">
                    <Activity className="size-5 text-background" />
                </div>
                <span className="text-lg font-semibold">PillDispenser</span>
            </div>

            {/* Progress */}
            {step !== "welcome" && (
                <div className="mb-8 flex items-center gap-2">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-2">
                            <div className={cn(
                                "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                                i < stepIndex  ? "bg-foreground text-background" :
                                    i === stepIndex ? "bg-foreground text-background ring-4 ring-foreground/20" :
                                        "bg-muted text-muted-foreground"
                            )}>
                                {i < stepIndex ? <Check className="size-3.5" /> : i + 1}
                            </div>
                            <span className={cn(
                                "text-sm",
                                i === stepIndex ? "font-medium" : "text-muted-foreground"
                            )}>{s.label}</span>
                            {i < STEPS.length - 1 && (
                                <ChevronRight className="size-4 text-muted-foreground" />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Welcome ──────────────────────────────────────────────────────────── */}
            {step === "welcome" && (
                <div className="w-full max-w-md space-y-6 text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-foreground">
                        <HardDrive className="size-8 text-background" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Let's set up your dispenser</h1>
                        <p className="mt-2 text-muted-foreground">
                            We'll register your ESP32 device and configure the 3 compartments.
                            This takes about 2 minutes.
                        </p>
                    </div>
                    <ol className="space-y-3 text-left">
                        {[
                            { icon: HardDrive, label: "Register your ESP32 device and get its unique key" },
                            { icon: Pill,      label: "Assign medications to each of the 3 compartments" },
                            { icon: Check,     label: "Head to the dashboard and set dispensing schedules" },
                        ].map(({ icon: Icon, label }, i) => (
                            <li key={i} className="flex items-center gap-3 rounded-xl border bg-background p-4">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted font-bold text-sm">
                                    {i + 1}
                                </div>
                                <Icon className="size-4 shrink-0 text-muted-foreground" />
                                <span className="text-sm">{label}</span>
                            </li>
                        ))}
                    </ol>
                    <button
                        onClick={() => setStep("device")}
                        className="w-full rounded-xl bg-foreground py-3 text-sm font-medium text-background hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
                    >
                        Get Started <ArrowRight className="size-4" />
                    </button>
                </div>
            )}

            {/* ── Device setup ─────────────────────────────────────────────────────── */}
            {step === "device" && (
                <div className="w-full max-w-md space-y-6">
                    <div>
                        <h2 className="text-xl font-bold">Register your ESP32</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Give it a name, then copy the device key into your firmware.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Label */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Device label</label>
                            <input
                                type="text"
                                placeholder="e.g. Bedroom Dispenser"
                                value={label}
                                onChange={e => setLabel(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && createDevice()}
                                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                            />
                        </div>

                        {/* Key */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Device key</label>
                            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5">
                                <code className="flex-1 text-xs break-all">{deviceKey}</code>
                                <button onClick={copyKey} className="shrink-0 text-muted-foreground hover:text-foreground">
                                    <Copy className="size-4" />
                                </button>
                                <button onClick={() => setDeviceKey(generateKey())} className="shrink-0 text-muted-foreground hover:text-foreground">
                                    <RefreshCw className="size-4" />
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                In your ESP32 sketch, set: <code className="bg-muted px-1 rounded">#define DEVICE_KEY "{deviceKey.slice(0,8)}…"</code>
                            </p>
                        </div>

                        {/* Warning */}
                        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                            Copy and save this key now — after registration it will be masked for security.
                        </div>
                    </div>

                    <button
                        onClick={createDevice}
                        disabled={isPending}
                        className="w-full rounded-xl bg-foreground py-3 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                    >
                        {isPending ? <Loader2 className="size-4 animate-spin" /> : <HardDrive className="size-4" />}
                        {isPending ? "Registering…" : "Register Device"}
                    </button>
                </div>
            )}

            {/* ── Compartments ─────────────────────────────────────────────────────── */}
            {step === "compartments" && (
                <div className="w-full max-w-lg space-y-6">
                    <div>
                        <h2 className="text-xl font-bold">Configure compartments</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Your dispenser has 3 slots. Fill in what's physically loaded into each one.
                            You can skip empty slots and update them later.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {compartments.map(c => (
                            <div key={c.slot} className="rounded-xl border bg-background p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "flex size-8 shrink-0 items-center justify-center rounded-lg font-bold text-sm text-white",
                                        c.slot === 1 ? "bg-blue-500" : c.slot === 2 ? "bg-violet-500" : "bg-emerald-500"
                                    )}>
                                        {c.slot}
                                    </div>
                                    <p className="font-medium">Compartment {c.slot}</p>
                                    {!c.medication_name && (
                                        <span className="ml-auto text-xs text-muted-foreground italic">Optional</span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Medication name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Metformin"
                                            value={c.medication_name}
                                            onChange={e => updateComp(c.slot, "medication_name", e.target.value)}
                                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Dosage (mg)</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 500"
                                            value={c.dosage_mg}
                                            onChange={e => updateComp(c.slot, "dosage_mg", e.target.value)}
                                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Pill count</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 28"
                                            value={c.pill_count}
                                            onChange={e => updateComp(c.slot, "pill_count", e.target.value)}
                                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep("done")}
                            className="flex-1 rounded-xl border py-3 text-sm font-medium hover:bg-muted/40 transition-colors"
                        >
                            Skip for now
                        </button>
                        <button
                            onClick={saveCompartments}
                            disabled={isPending}
                            className="flex-1 rounded-xl bg-foreground py-3 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                        >
                            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                            {isPending ? "Saving…" : "Save & Continue"}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Done ─────────────────────────────────────────────────────────────── */}
            {step === "done" && (
                <div className="w-full max-w-md space-y-6 text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
                        <Check className="size-8 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">You're all set!</h2>
                        <p className="mt-2 text-muted-foreground">
                            Your dispenser is registered. Flash the device key to your ESP32, then
                            head to the dashboard to set dispensing schedules.
                        </p>
                    </div>

                    <div className="space-y-3 text-left rounded-xl border bg-background p-4 text-sm">
                        <p className="font-medium">Next steps:</p>
                        {[
                            "Flash the DEVICE_KEY and your WiFi credentials to the ESP32",
                            "Power on the dispenser — it should appear Online within 30s",
                            "Go to Schedules and create your first dispense schedule",
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-2 text-muted-foreground">
                                <span className="mt-0.5 font-bold text-foreground">{i + 1}.</span>
                                {step}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full rounded-xl bg-foreground py-3 text-sm font-medium text-background hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
                    >
                        Go to Dashboard <ArrowRight className="size-4" />
                    </button>
                </div>
            )}
        </div>
    )
}