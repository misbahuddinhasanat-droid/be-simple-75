import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, ordersTable } from "../_lib/db.js";
import { verifyToken } from "../_lib/auth-utils.js";
import { eq, desc } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: "Invalid token" });

  try {
    const db = getDb();
    const orders = await db.select().from(ordersTable)
      .where(eq(ordersTable.userId, decoded.userId))
      .orderBy(desc(ordersTable.createdAt));
    
    return res.json(orders);
  } catch (err) {
    console.error("My orders error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
