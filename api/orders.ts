import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, ordersTable } from "./_lib/db.js";
import { eq } from "drizzle-orm";
import { cors } from "./_lib/admin-auth.js";

function formatOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id, customerName: o.customerName, email: o.email,
    customerPhone: o.customerPhone,
    address: o.address, city: o.city, country: o.country, zipCode: o.zipCode,
    status: o.status, totalAmount: parseFloat(o.total), total: parseFloat(o.total),
    items: o.items as unknown[], createdAt: o.createdAt.toISOString(),
    userId: o.userId,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const db = getDb();

  // GET /api/orders?id=X
  if (req.method === "GET") {
    try {
      const id = parseInt(req.query.id as string);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid order ID" });

      const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
      if (!order) return res.status(404).json({ error: "Order not found" });
      return res.json(formatOrder(order));
    } catch (err) {
      console.error("Failed to get order", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // POST /api/orders
  if (req.method === "POST") {
    try {
      const { customerName, email, customerPhone, address, city, country, zipCode, items, totalAmount, userId } = req.body;
      const calculatedTotal = totalAmount ? parseFloat(totalAmount) : (items as Array<{ price?: number; quantity: number }>).reduce(
        (sum: number, item: { price?: number; quantity: number }) => sum + ((item.price ?? 0) * item.quantity), 0
      );
      const [order] = await db.insert(ordersTable).values({
        customerName, email, customerPhone, address, city, country, zipCode,
        status: "confirmed", total: calculatedTotal.toFixed(2), items: items as unknown[], userId
      }).returning();
      return res.status(201).json(formatOrder(order));
    } catch (err) {
      console.error("Failed to create order", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
