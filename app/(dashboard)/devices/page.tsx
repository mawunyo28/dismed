"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	HardDrive,
	Wifi,
	WifiOff,
	RefreshCw,
	Plus,
	Copy,
	Eye,
	EyeOff,
	CheckCircle,
	AlertTriangle,
	Clock,
	Trash2,
	Pencil,
	Save,
	X,
	Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Device {
	id: string;
	label: string | null;
	device_key: string;
	firmware: string | null;
	is_online: boolean;
	last_seen_at: string | null;
	created_at: string;
}

interface Compartment {
	slot: number;
	medication_name: string | null;
	pill_count: number;
	capacity: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string | null) {
	if (!iso) return "Never";
	const diff = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(diff / 60000);
	if (mins < 1) return "Just now";
	if (mins < 60) return `${mins}m ago`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs}h ago`;
	return new Date(iso).toLocaleDateString();
}

function generateKey() {
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	return Array.from(
		{ length: 32 },
		() => chars[Math.floor(Math.random() * chars.length)],
	).join("");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DevicesPage() {
	const supabase = useMemo(() => createClient(), []);

	const [devices, setDevices] = useState<Device[]>([]);
	const [compartmentsMap, setCompartmentsMap] = useState<
		Record<string, Compartment[]>
	>({});
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState<string | null>(null);

	// Add device dialog
	const [showAdd, setShowAdd] = useState(false);
	const [newLabel, setNewLabel] = useState("");
	const [newKey, setNewKey] = useState(generateKey());
	const [saving, setSaving] = useState(false);

	// Edit label dialog
	const [editDevice, setEditDevice] = useState<Device | null>(null);
	const [editLabel, setEditLabel] = useState("");

	// Show/hide device key
	const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

	const load = useCallback(async () => {
		setLoading(true);
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			setLoading(false);
			return;
		}
		setUserId(user.id);

		const { data: devs, error } = await supabase
			.from("devices")
			.select(
				"id, label, device_key, firmware, is_online, last_seen_at, created_at",
			)
			.eq("owner_id", user.id)
			.order("created_at");

		if (error) {
			toast.error(error.message);
			setLoading(false);
			return;
		}
		setDevices(devs ?? []);

		// Fetch compartments for each device
		if (devs && devs.length > 0) {
			const { data: comps } = await supabase
				.from("compartments")
				.select("device_id, slot, medication_name, pill_count, capacity")
				.in(
					"device_id",
					devs.map((d) => d.id),
				);

			const map: Record<string, Compartment[]> = {};
			for (const c of comps ?? []) {
				if (!map[c.device_id]) map[c.device_id] = [];
				map[c.device_id].push(c);
			}
			setCompartmentsMap(map);
		}

		setLoading(false);
	}, [supabase]);

	useEffect(() => {
		load();
	}, [load]);

	// ── Real-time: watch device online status ───────────────────────────────────

	useEffect(() => {
		if (!userId) return;
		const channel = supabase
			.channel("devices-status")
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "devices",
					filter: `owner_id=eq.${userId}`,
				},
				(payload) => {
					const updated = payload.new as Device;
					setDevices((prev) =>
						prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d)),
					);
				},
			)
			.subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, [userId, supabase]);

	// ── Add device ──────────────────────────────────────────────────────────────

	// const addDevice = async () => {
	// 	if (!userId) return;
	// 	if (!newLabel.trim()) {
	// 		toast.error("Please give your device a label");
	// 		return;
	// 	}
	// 	setSaving(true);
	//
	// 	const { error } = await supabase.from("devices").insert({
	// 		owner_id: userId,
	// 		label: newLabel.trim(),
	// 		device_key: newKey,
	// 		firmware: "v1.0.0",
	// 		is_online: false,
	// 	});
	//
	// 	if (error) {
	// 		toast.error(error.message);
	// 	} else {
	// 		toast.success("Device registered! Flash the device key to your ESP32.");
	// 		setShowAdd(false);
	// 		setNewLabel("");
	// 		setNewKey(generateKey());
	// 		load();
	// 	}
	// 	setSaving(false);
	// };

	const addDevice = async () => {
		if (!userId) return;
		if (!newLabel.trim()) {
			toast.error("Please give your device a label");
			return;
		}
		setSaving(true);

		// Ensure profile row exists first — devices.owner_id → profiles(id)
		const { error: profileError } = await supabase
			.from("profiles")
			.upsert({ id: userId }, { onConflict: "id", ignoreDuplicates: true });

		if (profileError) {
			toast.error("Profile error: " + profileError.message);
			setSaving(false);
			return;
		}

		const { error } = await supabase.from("devices").insert({
			owner_id: userId,
			label: newLabel.trim(),
			device_key: newKey,
			firmware: "v1.0.0",
			is_online: false,
		});

		if (error) {
			toast.error(error.message);
		} else {
			toast.success("Device registered! Flash the device key to your ESP32.");
			setShowAdd(false);
			setNewLabel("");
			setNewKey(generateKey());
			load();
		}
		setSaving(false);
	};

	// ── Edit label ──────────────────────────────────────────────────────────────

	const saveLabel = async () => {
		if (!editDevice) return;
		const { error } = await supabase
			.from("devices")
			.update({ label: editLabel.trim() })
			.eq("id", editDevice.id);
		if (error) toast.error(error.message);
		else {
			toast.success("Label updated");
			setEditDevice(null);
			load();
		}
	};

	// ── Delete device ───────────────────────────────────────────────────────────

	const deleteDevice = async (id: string) => {
		if (
			!confirm(
				"Remove this device? All compartment and schedule data will be deleted.",
			)
		)
			return;
		const { error } = await supabase.from("devices").delete().eq("id", id);
		if (error) toast.error(error.message);
		else {
			toast.success("Device removed");
			load();
		}
	};

	// ── Copy key ────────────────────────────────────────────────────────────────

	const copyKey = (key: string) => {
		navigator.clipboard.writeText(key);
		toast.success("Device key copied to clipboard");
	};

	const toggleReveal = (id: string) =>
		setRevealedKeys((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});

	// ─── Render ───────────────────────────────────────────────────────────────

	return (
		<div className="flex flex-col gap-6 p-6">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Devices</h1>
					<p className="text-muted-foreground">
						Manage your ESP32 dispensers. Each device has a unique key used for
						API authentication.
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={load} disabled={loading}>
						<RefreshCw
							className={cn("mr-2 size-4", loading && "animate-spin")}
						/>
						Refresh
					</Button>
					<Button
						size="sm"
						onClick={() => {
							setNewKey(generateKey());
							setShowAdd(true);
						}}
					>
						<Plus className="mr-2 size-4" />
						Add Device
					</Button>
				</div>
			</div>

			{/* Device list */}
			{loading ? (
				<div className="flex items-center justify-center py-16">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : devices.length === 0 ? (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center gap-4 py-16 text-center">
						<HardDrive className="size-12 text-muted-foreground/40" />
						<div>
							<p className="font-semibold">No devices registered</p>
							<p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
								Add your ESP32 dispenser to start automating medication
								schedules.
							</p>
						</div>
						<Button
							onClick={() => {
								setNewKey(generateKey());
								setShowAdd(true);
							}}
						>
							<Plus className="mr-2 size-4" /> Register Device
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="flex flex-col gap-4">
					{devices.map((device) => {
						const comps = compartmentsMap[device.id] ?? [];
						const revealed = revealedKeys.has(device.id);

						return (
							<Card
								key={device.id}
								className={cn(
									"border-2 transition-colors",
									device.is_online ? "border-green-200" : "border-muted",
								)}
							>
								<CardContent className="p-5">
									<div className="flex flex-wrap items-start gap-4">
										{/* Status icon */}
										<div
											className={cn(
												"flex size-12 shrink-0 items-center justify-center rounded-xl",
												device.is_online ? "bg-green-100" : "bg-muted",
											)}
										>
											{device.is_online ? (
												<Wifi className="size-6 text-green-600" />
											) : (
												<WifiOff className="size-6 text-muted-foreground" />
											)}
										</div>

										{/* Info */}
										<div className="flex-1 min-w-0 space-y-2">
											<div className="flex flex-wrap items-center gap-2">
												<h2 className="font-semibold text-lg">
													{device.label ?? "Unnamed Device"}
												</h2>
												<Badge
													className={
														device.is_online
															? "bg-green-500"
															: "bg-muted text-muted-foreground"
													}
												>
													{device.is_online ? "Online" : "Offline"}
												</Badge>
												{device.firmware && (
													<Badge variant="outline" className="text-xs">
														{device.firmware}
													</Badge>
												)}
											</div>

											<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
												<span className="flex items-center gap-1">
													<Clock className="size-3" />
													Last seen: {relativeTime(device.last_seen_at)}
												</span>
												<span>
													ID:{" "}
													<code className="text-xs">
														{device.id.slice(0, 8)}…
													</code>
												</span>
											</div>

											{/* Device key */}
											<div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
												<code className="flex-1 text-xs break-all text-muted-foreground">
													{revealed ? device.device_key : "•".repeat(32)}
												</code>
												<button
													onClick={() => toggleReveal(device.id)}
													className="shrink-0 text-muted-foreground hover:text-foreground"
													title={revealed ? "Hide key" : "Reveal key"}
												>
													{revealed ? (
														<EyeOff className="size-3.5" />
													) : (
														<Eye className="size-3.5" />
													)}
												</button>
												<button
													onClick={() => copyKey(device.device_key)}
													className="shrink-0 text-muted-foreground hover:text-foreground"
													title="Copy key"
												>
													<Copy className="size-3.5" />
												</button>
											</div>
											<p className="text-xs text-muted-foreground">
												Flash this key into the ESP32 as <code>DEVICE_KEY</code>
												. Keep it secret.
											</p>

											{/* Compartments mini-view */}
											{comps.length > 0 && (
												<div className="flex gap-2 pt-1">
													{comps
														.sort((a, b) => a.slot - b.slot)
														.map((c) => (
															<div
																key={c.slot}
																className={cn(
																	"flex flex-col items-center gap-0.5 rounded-lg border px-3 py-2 text-center text-xs",
																	c.medication_name
																		? "bg-background"
																		: "bg-muted/30 border-dashed",
																)}
															>
																<span className="font-semibold">
																	Slot {c.slot}
																</span>
																<span className="text-muted-foreground truncate max-w-[80px]">
																	{c.medication_name ?? "Empty"}
																</span>
																{c.medication_name && (
																	<span
																		className={cn(
																			"font-medium",
																			c.pill_count / c.capacity < 0.2
																				? "text-amber-600"
																				: "text-green-600",
																		)}
																	>
																		{c.pill_count} pills
																	</span>
																)}
															</div>
														))}
												</div>
											)}
										</div>

										{/* Actions */}
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => {
													setEditDevice(device);
													setEditLabel(device.label ?? "");
												}}
												title="Rename"
											>
												<Pencil className="size-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => deleteDevice(device.id)}
												title="Remove"
											>
												<Trash2 className="size-4 text-red-500" />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			{/* ESP32 integration note */}
			<Card className="bg-muted/40 border-dashed">
				<CardContent className="py-4">
					<p className="text-sm font-medium mb-2">ESP32 API Endpoints</p>
					<div className="space-y-1 text-xs text-muted-foreground font-mono">
						<p>
							POST /api/device/heartbeat — called every 30s (updates online
							status)
						</p>
						<p>GET /api/device/schedule — fetch today's dispense schedule</p>
						<p>POST /api/device/dispense — report each dispense event</p>
						<p>GET /api/device/commands — poll for manual dispense commands</p>
					</div>
					<p className="mt-2 text-xs text-muted-foreground">
						All requests require header:{" "}
						<code className="bg-muted px-1 rounded">
							X-Device-Key: your-key
						</code>
					</p>
				</CardContent>
			</Card>

			{/* Add device dialog */}
			<Dialog open={showAdd} onOpenChange={setShowAdd}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Register ESP32 Device</DialogTitle>
						<DialogDescription>
							Give your dispenser a name and copy the generated key into your
							ESP32 firmware.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-2">
						<div className="space-y-1.5">
							<Label htmlFor="device-label">Device Label</Label>
							<Input
								id="device-label"
								placeholder="e.g. Bedroom Dispenser"
								value={newLabel}
								onChange={(e) => setNewLabel(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && addDevice()}
							/>
						</div>

						<div className="space-y-1.5">
							<Label>Device Key</Label>
							<div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
								<code className="flex-1 text-xs break-all">{newKey}</code>
								<button
									onClick={() => copyKey(newKey)}
									className="shrink-0 text-muted-foreground hover:text-foreground"
								>
									<Copy className="size-3.5" />
								</button>
							</div>
							<div className="flex justify-between items-center">
								<p className="text-xs text-muted-foreground">
									Define this as <code>DEVICE_KEY</code> in your ESP32 sketch.
								</p>
								<button
									onClick={() => setNewKey(generateKey())}
									className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
								>
									Regenerate
								</button>
							</div>
						</div>

						<div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
							<p className="text-xs text-amber-800 flex items-start gap-2">
								<AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
								Save this key now — for security it will be masked after
								registration. You can always generate a new key from the devices
								list.
							</p>
						</div>
					</div>

					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => setShowAdd(false)}>
							<X className="mr-2 size-4" /> Cancel
						</Button>
						<Button onClick={addDevice} disabled={saving}>
							{saving ? (
								<Loader2 className="mr-2 size-4 animate-spin" />
							) : (
								<CheckCircle className="mr-2 size-4" />
							)}
							Register Device
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit label dialog */}
			<Dialog
				open={!!editDevice}
				onOpenChange={(open) => !open && setEditDevice(null)}
			>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>Rename Device</DialogTitle>
					</DialogHeader>
					<div className="space-y-1.5 py-2">
						<Label htmlFor="edit-label">Label</Label>
						<Input
							id="edit-label"
							value={editLabel}
							onChange={(e) => setEditLabel(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && saveLabel()}
						/>
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => setEditDevice(null)}>
							<X className="mr-2 size-4" /> Cancel
						</Button>
						<Button onClick={saveLabel}>
							<Save className="mr-2 size-4" /> Save
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
