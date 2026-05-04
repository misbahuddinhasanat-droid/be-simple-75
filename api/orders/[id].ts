import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, ordersTable } from "../_lib/db";
import { eq } from "drizzle-orm";
import { cors } from "../_lib/admin-auth";

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
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const id = parseInt(req.query.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid order ID" });

    const db = getDb();
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(formatOrder(order));
  } catch (err) {
    console.error("Failed to get order", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
