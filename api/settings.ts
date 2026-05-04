import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, settingsTable } from "./_lib/db";
import { cors } from "./_lib/admin-auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const db = getDb();
    const rows = await db.select().from(settingsTable);
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    res.json({
      gtmId: map["gtm_id"] ?? "",
      pixelId: map["pixel_id"] ?? "",
      storeInfo: {
        whatsappNumber: map["si_whatsapp_number"] ?? "",
        whatsappUrl: map["si_whatsapp_url"] ?? "",
        instagramHandle: map["si_instagram_handle"] ?? "@besimple75bd",
        instagramUrl: map["si_instagram_url"] ?? "https://instagram.com/besimple75bd",
        facebookUrl: map["si_facebook_url"] ?? "https://facebook.com/besimple75",
        email: map["si_email"] ?? "support@besimple75.com",
        policyReturn: map["si_policy_return"] ?? "7-day return on unworn items",
        policyDelivery: map["si_policy_delivery"] ?? "Dhaka: 1-2 days · Outside: 3-5 days",
        policyPayment: map["si_policy_payment"] ?? "Cash on Delivery (COD)",
      },
    });
  } catch (err) {
    console.error("Failed to get settings", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
