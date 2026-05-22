import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — ESP32 polls for pending manual commands
export async function GET(req: NextRequest) {
    const key = req.headers.get("x-device-key")
    if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: device } = await supabase
        .from("devices").select("id").eq("device_key", key).single()
    if (!device) return NextResponse.json({ error: "Unknown device" }, { status: 403 })

    const { data: commands } = await supabase
        .from("dispense_commands")
        .select("id, slot")
        .eq("device_id", device.id)
        .eq("status", "pending")
        .order("created_at")

    return NextResponse.json({ commands: commands ?? [] })
}

// POST — ESP32 marks a command as done or failed
// Body: { command_id: "uuid", result: "done"|"failed" }
export async function POST(req: NextRequest) {
    const key = req.headers.get("x-device-key")
    if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { command_id, result } = body

    await supabase
        .from("dispense_commands")
        .update({ status: result, executed_at: new Date().toISOString() })
        .eq("id", command_id)

    return NextResponse.json({ ok: true })
}
