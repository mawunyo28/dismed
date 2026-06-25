// app/api/devices/dispense/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? ""

  let device_key: string | null = null
  let slot: number
  let comp_id: string | null
  let status: string
  let triggered_by: string

  if (contentType.includes("application/json")) {
    const body = await req.json()
    device_key   = body.device_key ?? body.key
    slot         = Number(body.slot)
    comp_id      = body.comp_id ?? body.compartment_id ?? null
    status       = body.status ?? "success"
    triggered_by = body.triggered_by ?? "schedule"
  } else {
    const text   = await req.text()
    const params = new URLSearchParams(text)
    device_key   = params.get("device_key") ?? params.get("key")
    slot         = Number(params.get("slot"))
    comp_id      = params.get("comp_id") ?? params.get("compartment_id") ?? null
    status       = params.get("status") ?? "success"
    triggered_by = params.get("triggered_by") ?? "schedule"
  }

  if (!device_key) {
    return NextResponse.json({ error: "device_key required" }, { status: 401 })
  }

  if (!slot || !status) {
    return NextResponse.json({ error: "slot and status required" }, { status: 400 })
  }

  const { data: device } = await supabase
    .from("devices")
    .select("id, owner_id")
    .eq("device_key", device_key)
    .single()

  if (!device) {
    return NextResponse.json({ error: "Unknown device" }, { status: 403 })
  }

  // Resolve compartment_id from slot if not provided
  if (!comp_id) {
    const { data: comp } = await supabase
      .from("compartments")
      .select("id")
      .eq("device_id", device.id)
      .eq("slot", slot)
      .single()
    comp_id = comp?.id ?? null
  }

  // Insert dispense event
  await supabase.from("dispense_events").insert({
    device_id:      device.id,
    compartment_id: comp_id,
    slot,
    status,
    triggered_by,
    dispensed_at:   new Date().toISOString(),
  })

  // Mark dispense_commands as done if manual
  if (triggered_by === "manual") {
    await supabase
      .from("dispense_commands")
      .update({
        status:      "done",
        executed_at: new Date().toISOString(),
      })
      .eq("device_id", device.id)
      .eq("slot", slot)
      .eq("status", "pending")
  }

  // Notifications for missed or jammed
  if (["missed", "jammed"].includes(status)) {
    const { data: comp } = await supabase
      .from("compartments")
      .select("medication_name")
      .eq("device_id", device.id)
      .eq("slot", slot)
      .single()

    const med     = comp?.medication_name ? ` for ${comp.medication_name}` : ""
    const isJam   = status === "jammed"

    await supabase.from("notifications").insert({
      owner_id: device.owner_id,
      title:    isJam
        ? `Dispenser Jammed: Slot ${slot}`
        : `Missed Dose: Slot ${slot}`,
      body:     isJam
        ? `The dispenser jammed in slot ${slot}${med}. Check the device.`
        : `The scheduled dose in slot ${slot}${med} was not dispensed.`,
      category: isJam ? "jammed" : "missed_dose",
    })
  }

  // Decrement pill_count on success
  if (status === "success" && comp_id) {
    const { data: comp } = await supabase
      .from("compartments")
      .select("id, pill_count, medication_name")
      .eq("id", comp_id)
      .single()

    if (comp && comp.pill_count > 0) {
      const newCount = comp.pill_count - 1

      await supabase
        .from("compartments")
        .update({
          pill_count:  newCount,
          updated_at:  new Date().toISOString(),
        })
        .eq("id", comp.id)

      // Low stock notification
      if (newCount < 5) {
        const med = comp.medication_name ? ` (${comp.medication_name})` : ""
        await supabase.from("notifications").insert({
          owner_id: device.owner_id,
          title:    `Low Stock: Slot ${slot}`,
          body:     `Slot ${slot}${med} has fewer than 5 pills remaining.`,
          category: "low_stock",
        })
      }
    }
  }

  return NextResponse.json({ ok: true })
}
