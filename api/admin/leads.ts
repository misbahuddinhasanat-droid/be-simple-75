import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, leadsTable } from "../_lib/db.js";
import { eq, desc } from "drizzle-orm";
import { requireAdmin, cors } from "../_lib/admin-auth.js";

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

  // POST /api/admin/leads (Fraud Check)
  if (req.method === "POST") {
    try {
      const { name, phone, address } = req.body;
      let score = 85;
      let reason = "Customer details appear normal. Manual review recommended for first-time buyers.";
      let grade = "A";

      const badKeywords = ["test", "fake", "demo", "dummy", "adsense", "click"];
      const lowerAddr = (address || "").toLowerCase();
      const lowerName = (name || "").toLowerCase();
      
      if (badKeywords.some(k => lowerAddr.includes(k) || lowerName.includes(k))) {
        score = 20; grade = "F"; reason = "Suspicious keywords found in name or address. Possible bot or test lead.";
      } else if (phone && (phone.length < 11 || phone.startsWith("000"))) {
        score = 35; grade = "D"; reason = "Invalid or suspicious phone number format.";
      } else if (phone && (phone.startsWith("017") || phone.startsWith("019") || phone.startsWith("018"))) {
        score = 95; grade = "A+"; reason = "Verified local carrier prefix. High probability of authentic customer.";
      }

      return res.json({ grade, score, reason });
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
