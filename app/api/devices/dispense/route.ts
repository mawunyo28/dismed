import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Body: { slot: 1|2|3, status: "success"|"missed"|"jammed"|"manual", schedule_id?: string }
export async function POST(req: NextRequest) {
    const key = req.headers.get("x-device-key")
    if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: device } = await supabase
        .from("devices").select("id").eq("device_key", key).single()
    if (!device) return NextResponse.json({ error: "Unknown device" }, { status: 403 })

    const body = await req.json()
    const { slot, status, schedule_id } = body

    if (!slot || !status) return NextResponse.json({ error: "slot and status required" }, { status: 400 })

    // Find compartment for this slot
    const { data: comp } = await supabase
        .from("compartments")
        .select("id, pill_count")
        .eq("device_id", device.id)
        .eq("slot", slot)
        .single()

    // Log the event
    await supabase.from("dispense_events").insert({
        device_id: device.id,
        compartment_id: comp?.id ?? null,
        slot,
        status,
        triggered_by: status === "manual" ? "manual" : "schedule",
    })

    // Decrement pill count on success
    if (status === "success" && comp && comp.pill_count > 0) {
        await supabase
            .from("compartments")
            .update({ pill_count: comp.pill_count - 1, updated_at: new Date().toISOString() })
            .eq("id", comp.id)

        // Alert if low stock (< 5 pills)
        if (comp.pill_count - 1 < 5) {
            const { data: device_row } = await supabase
                .from("devices").select("owner_id").eq("id", device.id).single()
            if (device_row) {
                await supabase.from("notifications").insert({
                    owner_id: device_row.owner_id,
                    title: "Low Stock Alert",
                    body: `Slot ${slot} has fewer than 5 pills remaining.`,
                    category: "low_stock",
                })
            }
        }
    }

    return NextResponse.json({ ok: true })
}
