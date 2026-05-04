import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, ordersTable } from "../../_lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin, cors } from "../../_lib/admin-auth";

function formatOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id, customerName: o.customerName, email: o.email,
    address: o.address, city: o.city, country: o.country, zipCode: o.zipCode,
    status: o.status, total: parseFloat(o.total),
    items: o.items as unknown[], createdAt: o.createdAt.toISOString(),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req, res)) return;
  if (req.method !== "PATCH") return res.status(405).json({ error: "Method not allowed" });

  try {
    const id = parseInt(req.query.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid order ID" });
    const { status } = req.body as { status?: string };
    const valid = ["confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!status || !valid.includes(status)) return res.status(400).json({ error: "Invalid status" });

    const db = getDb();
    const [updated] = await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Order not found" });
    res.json(formatOrder(updated));
  } catch (err) {
    console.error("Failed to update order", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
