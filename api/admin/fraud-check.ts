import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, settingsTable } from "../../_lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin, cors } from "../../_lib/admin-auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const phone = (req.query.phone as string)?.replace(/\s/g, "");
    if (!phone || !/^01[3-9]\d{8}$/.test(phone)) {
      return res.status(400).json({ error: "Invalid Bangladesh phone number" });
    }
    const db = getDb();
    const rows = await db.select().from(settingsTable).where(eq(settingsTable.key, "bdcourier_api_key"));
    const apiKey = rows[0]?.value;
    if (!apiKey) {
      return res.status(400).json({ error: "BD Courier API key not configured" });
    }
    const bdRes = await fetch(`https://portal.packzy.com/api/v1/fraud_check/${phone}`, {
      headers: { "Api-Key": apiKey, "Secret-Key": apiKey, "Content-Type": "application/json" },
    });
    if (!bdRes.ok) {
      const alt = await fetch(`https://app.bdcourier.com/api/v1/merchant/check-customer`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!alt.ok) return res.status(alt.status).json({ error: `BD Courier API error: ${alt.status}` });
      const data = await alt.json() as any;
      if (!data.success) return res.status(400).json({ error: "BD Courier returned error" });
      return res.json(formatFraudResult(phone, data.data ?? {}));
    }
    const data = await bdRes.json() as any;
    res.json(formatFraudResult(phone, data));
  } catch (err) {
    console.error("Failed to check fraud", err);
    res.status(500).json({ error: "Failed to reach BD Courier API" });
  }
}

function formatFraudResult(phone: string, data: Record<string, unknown>) {
  const totalOrder = Number(data.total_order ?? data.total ?? 0);
  const cancelOrder = Number(data.cancel_order ?? data.cancelled ?? 0);
  const cancelRate = totalOrder > 0 ? Math.round((cancelOrder / totalOrder) * 100) : 0;
  let grade = String(data.grade ?? "");
  if (!grade) {
    if (cancelRate === 0) grade = "A+";
    else if (cancelRate < 10) grade = "A";
    else if (cancelRate < 25) grade = "B";
    else if (cancelRate < 50) grade = "C";
    else if (cancelRate < 75) grade = "D";
    else grade = "F";
  }
  return { phone, totalOrder, cancelOrder, cancelRate, grade };
}
