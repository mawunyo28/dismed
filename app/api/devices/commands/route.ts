// app/api/devices/commands/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET — ESP32 polls for pending manual dispense commands
// Returns plain text "none" or "slot:N:command_uuid"
export async function GET(req: NextRequest) {
    const device_key =
        req.headers.get("x-device-key") ?? req.nextUrl.searchParams.get("key");

    if (!device_key) {
        return new NextResponse("error:no_key", { status: 401 });
    }

    const { data: device } = await supabase
        .from("devices")
        .select("id")
        .eq("device_key", device_key)
        .single();

    if (!device) {
        return new NextResponse("error:unknown_device", { status: 403 });
    }

    const { data: command } = await supabase
        .from("dispense_commands")
        .select("id, slot")
        .eq("device_id", device.id)
        .eq("status", "pending")
        .order("created_at")
        .limit(1)
        .single();

    if (!command) {
        return new NextResponse("none", {
            headers: { "Content-Type": "text/plain" },
        });
    }

    // "slot:2:command-uuid"
    return new NextResponse(`slot:${command.slot}:${command.id}`, {
        headers: { "Content-Type": "text/plain" },
    });
}

// POST — ESP32 explicitly marks a command as done
// In most cases the /dispense route handles this automatically
// This exists as a fallback if the ESP32 wants to mark it separately
export async function POST(req: NextRequest) {
    const contentType = req.headers.get("content-type") ?? "";

    let device_key: string | null = null;
    let command_id: string | null = null;
    let result: string;

    if (contentType.includes("application/json")) {
        const body = await req.json();
        device_key = body.device_key ?? body.key;
        command_id = body.command_id;
        result = body.result ?? "done";
    } else {
        const text = await req.text();
        const params = new URLSearchParams(text);
        device_key = params.get("device_key") ?? params.get("key");
        command_id = params.get("command_id");
        result = params.get("result") ?? "done";
    }

    if (!device_key || !command_id) {
        return NextResponse.json(
            { error: "device_key and command_id required" },
            { status: 400 },
        );
    }

    const { data: device } = await supabase
        .from("devices")
        .select("id")
        .eq("device_key", device_key)
        .single();

    if (!device) {
        return NextResponse.json({ error: "Unknown device" }, { status: 403 });
    }

    await supabase
        .from("dispense_commands")
        .update({
            status: result,
            executed_at: new Date().toISOString(),
        })
        .eq("id", command_id)
        .eq("device_id", device.id); // scoped to this device for safety

    return NextResponse.json({ ok: true });
}
