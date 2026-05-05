import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, ordersTable } from "./_lib/db.js";
import { verifyToken } from "./_lib/auth-utils.js";
import { eq, and, desc } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action || req.url?.split("/").pop()?.split("?")[0];

  // ─── TRACK ORDER (PUBLIC) ──────────────────────────────────────────────────
  if (action === "track") {
    try {
      const id = Number(req.query.id);
      const phone = req.query.phone as string;

      if (!id || !phone) {
        return res.status(400).json({ error: "Order ID and phone number are required" });
      }

      const db = getDb();
      const rows = await db.select()
        .from(ordersTable)
        .where(and(eq(ordersTable.id, id), eq(ordersTable.customerPhone, phone)));

      if (rows.length === 0) return res.status(404).json({ error: "Order not found" });

      const order = rows[0];
      return res.json({
        id: order.id, status: order.status, customerName: order.customerName,
        productName: order.productName, totalAmount: order.totalAmount, createdAt: order.createdAt
      });
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // ─── AUTHENTICATED ROUTES ──────────────────────────────────────────────────
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: "Invalid token" });

  if (action === "orders") {
    try {
      const db = getDb();
      const orders = await db.select().from(ordersTable)
        .where(eq(ordersTable.userId, decoded.userId))
        .orderBy(desc(ordersTable.createdAt));
      
      return res.json(orders);
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(404).json({ error: "Action not found" });
}
