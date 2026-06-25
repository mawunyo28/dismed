// app/api/devices/schedule/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const device_key =
    req.headers.get("x-device-key") ??
    req.nextUrl.searchParams.get("key")

  if (!device_key) {
    return new NextResponse("error:no_key", { status: 401 })
  }

  const { data: device } = await supabase
    .from("devices")
    .select("id")
    .eq("device_key", device_key)
    .single()

  if (!device) {
    return new NextResponse("error:unknown_device", { status: 403 })
  }

  const { data: schedules } = await supabase
    .from("schedules")
    .select(`
      id,
      dispense_time,
      compartment_id,
      pills_per_dose,
      compartments ( slot )
    `)
    .eq("device_id", device.id)
    .eq("active", true)

  if (!schedules || schedules.length === 0) {
    return new NextResponse("", {
      headers: { "Content-Type": "text/plain" },
    })
  }

  // CSV format: HH:MM,slot,schedule_uuid,compartment_uuid,pills_per_dose
  const lines = schedules.map((s: any) => {
    const time  = s.dispense_time.substring(0, 5)          // "HH:MM"
    const slot  = s.compartments?.slot ?? 1
    const pills = s.pills_per_dose ?? 1
    return `${time},${slot},${s.id},${s.compartment_id},${pills}`
  })

  return new NextResponse(lines.join("\n"), {
    headers: { "Content-Type": "text/plain" },
  })
}
