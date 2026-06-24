// app/api/devices/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

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

    const { data: schedules } = await supabase
        .from("schedules")
        .select(
            "id, dispense_time, days_of_week, compartment_id, compartments(slot)",
        )
        .eq("device_id", device.id)
        .eq("active", true);

    if (!schedules || schedules.length === 0) {
        return new NextResponse("", {
            headers: { "Content-Type": "text/plain" },
        });
    }

    const lines = schedules.map((s: any) => {
        const time = s.dispense_time.substring(0, 5); // "HH:MM"
        const slot = s.compartments?.slot ?? 1;
        const days = "-" + s.days_of_week.join("-") + "-"; // "-1-2-3-4-5-"
        return `${time},${slot},${days},${s.id},${s.compartment_id}`;
    });

    return new NextResponse(lines.join("\n"), {
        headers: { "Content-Type": "text/plain" },
    });
}
