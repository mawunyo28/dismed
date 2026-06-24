// app/api/devices/dispense/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
    const headerKey = req.headers.get("x-device-key");
    const contentType = req.headers.get("content-type") ?? "";

    let device_key: string | null = headerKey;
    let slot: number, status: string, schedule_id: string | null;
    let compartment_id: string | null, triggered_by: string;

    if (contentType.includes("application/json")) {
        const body = await req.json();
        device_key = device_key ?? body.key ?? body.device_key;
        slot = Number(body.slot);
        status = body.status;
        schedule_id = body.sched_id ?? null;
        compartment_id = body.comp_id ?? null;
        triggered_by = body.triggered_by ?? "schedule";
    } else {
        const text = await req.text();
        const params = new URLSearchParams(text);
        device_key = device_key ?? params.get("key");
        slot = Number(params.get("slot"));
        status = params.get("status") ?? "success";
        schedule_id = params.get("sched_id");
        compartment_id = params.get("comp_id");
        triggered_by = params.get("triggered_by") ?? "schedule";
    }

    if (!device_key) {
        return NextResponse.json({ error: "device_key required" }, { status: 401 });
    }

    const { data: device } = await supabase
        .from("devices")
        .select("id, owner_id")
        .eq("device_key", device_key)
        .single();

    if (!device) {
        return NextResponse.json({ error: "Unknown device" }, { status: 403 });
    }

    // Resolve compartment_id from slot if not provided
    if (!compartment_id && slot) {
        const { data: comp } = await supabase
            .from("compartments")
            .select("id")
            .eq("device_id", device.id)
            .eq("slot", slot)
            .single();
        compartment_id = comp?.id ?? null;
    }

    // Log the event
    await supabase.from("dispense_events").insert({
        device_id: device.id,
        compartment_id,
        slot,
        status,
        triggered_by,
        dispensed_at: new Date().toISOString(),
    });

    // Mark command as done if triggered by manual
    if (triggered_by === "manual") {
        await supabase
            .from("dispense_commands")
            .update({
                status: "done",
                executed_at: new Date().toISOString(),
            })
            .eq("device_id", device.id)
            .eq("slot", slot)
            .eq("status", "pending");
    }

    // Notifications for missed/jammed
    if (["missed", "jammed"].includes(status)) {
        const { data: comp } = await supabase
            .from("compartments")
            .select("medication_name")
            .eq("device_id", device.id)
            .eq("slot", slot)
            .single();

        const med = comp?.medication_name ? ` for ${comp.medication_name}` : "";

        await supabase.from("notifications").insert({
            owner_id: device.owner_id,
            title:
                status === "jammed"
                    ? `Dispenser Jammed: Slot ${slot}`
                    : `Missed Dose: Slot ${slot}`,
            body:
                status === "jammed"
                    ? `The dispenser jammed in slot ${slot}${med}. Check the device.`
                    : `The scheduled dose in slot ${slot}${med} was not dispensed.`,
            category: status === "jammed" ? "jammed" : "missed_dose",
        });
    }

    // Decrement pill_count on success
    if (status === "success" && compartment_id) {
        const { data: comp } = await supabase
            .from("compartments")
            .select("id, pill_count, medication_name")
            .eq("id", compartment_id)
            .single();

        if (comp && comp.pill_count > 0) {
            const newCount = comp.pill_count - 1;
            await supabase
                .from("compartments")
                .update({
                    pill_count: newCount,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", comp.id);

            if (newCount < 5) {
                const med = comp.medication_name ? ` (${comp.medication_name})` : "";
                await supabase.from("notifications").insert({
                    owner_id: device.owner_id,
                    title: `Low Stock: Slot ${slot}`,
                    body: `Slot ${slot}${med} has fewer than 5 pills remaining.`,
                    category: "low_stock",
                });
            }
        }
    }

    return NextResponse.json({ ok: true });
}
