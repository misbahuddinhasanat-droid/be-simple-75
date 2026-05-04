import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, leadsTable } from "../_lib/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin, cors } from "../_lib/admin-auth";

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

  const db = getDb();

  // GET /api/admin/leads
  if (req.method === "GET") {
    try {
      const { status } = req.query as { status?: string };
      const leads = status && status !== "all"
        ? await db.select().from(leadsTable).where(eq(leadsTable.status, status)).orderBy(desc(leadsTable.createdAt))
        : await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));
      return res.json(leads.map(formatLead));
    } catch (err) {
      console.error("Failed to list leads", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // PATCH /api/admin/leads?id=X
  if (req.method === "PATCH") {
    try {
      const id = parseInt(req.query.id as string);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid lead ID" });
      const { status, notes } = req.body;
      const valid = ["new", "called", "converted", "not_interested"];
      const updateData: Record<string, unknown> = {};
      if (status && valid.includes(status)) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      if (Object.keys(updateData).length === 0) return res.status(400).json({ error: "No fields to update" });

      const [updated] = await db.update(leadsTable).set(updateData).where(eq(leadsTable.id, id)).returning();
      if (!updated) return res.status(404).json({ error: "Lead not found" });
      return res.json(formatLead(updated));
    } catch (err) {
      console.error("Failed to update lead", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
