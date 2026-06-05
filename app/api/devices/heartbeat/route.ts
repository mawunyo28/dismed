export async function POST(req: NextRequest) {
	const key = req.headers.get("x-device-key");
	console.log("[heartbeat] key received:", key);

	if (!key)
		return NextResponse.json({ error: "Missing device key" }, { status: 401 });

	const { data: device, error } = await supabase
		.from("devices")
		.update({ is_online: true, last_seen_at: new Date().toISOString() })
		.eq("device_key", key)
		.select("id")
		.single();

	console.log("[heartbeat] device:", device, "error:", error);

	if (error || !device)
		return NextResponse.json({ error: "Unknown device" }, { status: 403 });
	return NextResponse.json({ ok: true, device_id: device.id });
}
