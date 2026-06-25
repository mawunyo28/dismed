import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
	const contentType = req.headers.get("content-type") ?? "";

	let device_key: string | null = null;

	if (contentType.includes("application/json")) {
		const body = await req.json().catch(() => ({}));
		device_key = body.device_key ?? body.key;
	} else {
		const text = await req.text();
		const params = new URLSearchParams(text);
		device_key = params.get("device_key") ?? params.get("key");
	}

	if (!device_key) {
		return NextResponse.json({ error: "device_key required" }, { status: 401 });
	}

	const { data: device, error } = await supabase
		.from("devices")
		.select("id")
		.eq("device_key", device_key)
		.single();

	if (error || !device) {
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
