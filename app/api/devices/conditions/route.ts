import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  // Use service role to bypass RLS restrictions securely on write operations
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { temperature, humidity } = req.body;

  if (temperature === undefined || humidity === undefined) {
    return res
      .status(400)
      .json({ error: "Missing environmental payload variables." });
  }

  const { data, error } = await supabase
    .from("medibot")
    .insert([
      { temperature: parseFloat(temperature), humidity: parseFloat(humidity) },
    ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res
    .status(200)
    .json({ success: true, message: "Data logged successfully" });
}
