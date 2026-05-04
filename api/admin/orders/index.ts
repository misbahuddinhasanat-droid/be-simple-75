import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, ordersTable } from "../../_lib/db";
import { eq, desc } from "drizzle-orm";
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
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const db = getDb();
    const { status } = req.query as { status?: string };
    const orders = status && status !== "all"
      ? await db.select().from(ordersTable).where(eq(ordersTable.status, status)).orderBy(desc(ordersTable.createdAt))
      : await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    res.json(orders.map(formatOrder));
  } catch (err) {
    console.error("Failed to list admin orders", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
