import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, leadsTable } from "../../_lib/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin, cors } from "../../_lib/admin-auth";

function formatLead(l: typeof leadsTable.$inferSelect) {
  return {
    id: l.id, phone: l.phone, name: l.name, email: l.email,
    cartItems: l.cartItems as unknown[], cartTotal: parseFloat(l.cartTotal),
    status: l.status, notes: l.notes, createdAt: l.createdAt.toISOString(),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const db = getDb();
    const { status } = req.query as { status?: string };
    const leads = status && status !== "all"
      ? await db.select().from(leadsTable).where(eq(leadsTable.status, status)).orderBy(desc(leadsTable.createdAt))
      : await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));
    res.json(leads.map(formatLead));
  } catch (err) {
    console.error("Failed to list leads", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
