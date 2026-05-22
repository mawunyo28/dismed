import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!   // server only — never expose to browser
)

export async function POST(req: NextRequest) {
    const key = req.headers.get("x-device-key")
    if (!key) return NextResponse.json({ error: "Missing device key" }, { status: 401 })

    const { data: device, error } = await supabase
        .from("devices")
        .update({ is_online: true, last_seen_at: new Date().toISOString() })
        .eq("device_key", key)
        .select("id")
        .single()

    if (error || !device) return NextResponse.json({ error: "Unknown device" }, { status: 403 })
    return NextResponse.json({ ok: true, device_id: device.id })
}
