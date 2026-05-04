import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, ordersTable } from "../_lib/db.js";
import { eq, and } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const id = Number(req.query.id);
    const phone = req.query.phone as string;

    if (!id || !phone) {
      return res.status(400).json({ error: "Order ID and phone number are required" });
    }

    const db = getDb();
    const rows = await db.select()
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.id, id),
          eq(ordersTable.customerPhone, phone)
        )
      );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = rows[0];
    return res.json({
      id: order.id,
      status: order.status,
      customerName: order.customerName,
      productName: order.productName,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt
    });
  } catch (err) {
    console.error("Tracking error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
