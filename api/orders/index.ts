import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, ordersTable } from "./_lib/db";
import { eq } from "drizzle-orm";
import { cors } from "./_lib/admin-auth";

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

  const db = getDb();

  if (req.method === "POST") {
    try {
      const { customerName, email, address, city, country, zipCode, items } = req.body;
      const total = (items as Array<{ price?: number; quantity: number }>).reduce(
        (sum: number, item: { price?: number; quantity: number }) => sum + ((item.price ?? 0) * item.quantity), 0
      );
      const [order] = await db.insert(ordersTable).values({
        customerName, email, address, city, country, zipCode,
        status: "confirmed", total: total.toFixed(2), items: items as unknown[],
      }).returning();
      return res.status(201).json(formatOrder(order));
    } catch (err) {
      console.error("Failed to create order", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
