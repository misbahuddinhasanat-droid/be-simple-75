import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, leadsTable } from "./_lib/db.js";
import { eq } from "drizzle-orm";
import { cors } from "./_lib/admin-auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body as Record<string, unknown>;
    /** Contact page — no BD phone required; stored in leads for admin inbox. */
    if (body?.kind === "contact") {
      const name = String(body.name ?? "").trim().slice(0, 120);
      const email = String(body.email ?? "").trim();
      const message = String(body.message ?? "").trim().slice(0, 4000);
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name.length || !emailOk || !message.length) {
        return res.status(400).json({ error: "Name, valid email, and message are required" });
      }
      const ref = `CX-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      const db = getDb();
      await db.insert(leadsTable).values({
        phone: ref,
        name,
        email,
        cartItems: [] as unknown[],
        cartTotal: "0",
        status: "new",
        notes: `[contact] ${message}`,
      });
      return res.json({ ok: true });
    }

    const { phone, name, email, cartItems, cartTotal } = body as {
      phone?: string;
      name?: string;
      email?: string;
      cartItems?: unknown[];
      cartTotal?: unknown;
    };
    if (!phone || !/^01[3-9]\d{8}$/.test(phone.replace(/\s/g, ""))) {
      return res.status(400).json({ error: "Invalid Bangladesh phone number" });
    }
    const cleanPhone = phone.replace(/\s/g, "");
    const db = getDb();
    const existing = await db.select().from(leadsTable).where(eq(leadsTable.phone, cleanPhone)).limit(1);

    if (existing.length > 0) {
      await db.update(leadsTable).set({
        name: name ?? existing[0].name,
        email: email ?? existing[0].email,
        cartItems: (cartItems ?? existing[0].cartItems) as unknown[],
        cartTotal: String(cartTotal ?? existing[0].cartTotal),
      }).where(eq(leadsTable.phone, cleanPhone));
    } else {
      await db.insert(leadsTable).values({
        phone: cleanPhone, name: name ?? "", email: email ?? "",
        cartItems: (cartItems ?? []) as unknown[], cartTotal: String(cartTotal ?? 0),
        status: "new", notes: "",
      });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to save lead", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
