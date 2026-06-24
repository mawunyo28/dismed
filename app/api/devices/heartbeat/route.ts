import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
	const headerKey = req.headers.get("x-device-key");
	let device_key = headerKey;

	if (!device_key) {
		const body = await req.json().catch(() => ({}));
		device_key = body.device_key;
	}

	if (!device_key) {
		return NextResponse.json({ error: "device_key required" }, { status: 401 });
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
		.from("devices")
		.update({
			last_seen_at: new Date().toISOString(),
			is_online: true,
		})
		.eq("id", device.id);

	return NextResponse.json({ ok: true });
}
