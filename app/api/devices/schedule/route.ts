import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
    const key = req.headers.get("x-device-key")
    if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: device } = await supabase
        .from("devices").select("id").eq("device_key", key).single()
    if (!device) return NextResponse.json({ error: "Unknown device" }, { status: 403 })

    const dow = new Date().getDay()  // 0=Sun … 6=Sat

    const { data: schedules } = await supabase
        .from("schedules")
        .select("id, dispense_time, days_of_week, pills_per_dose, compartments(slot)")
        .eq("device_id", device.id)
        .eq("active", true)
        .contains("days_of_week", [dow])  // only today's schedules

    // Return compact payload the ESP32 can parse
    const payload = (schedules ?? []).map(s => ({
        id: s.id,
        slot: (s.compartments as any)?.slot,
        time: s.dispense_time.substring(0, 5),   // "HH:MM"
        pills: s.pills_per_dose,
    }))

    return NextResponse.json({ schedules: payload })
}
