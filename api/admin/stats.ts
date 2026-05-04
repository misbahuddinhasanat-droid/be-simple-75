import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, ordersTable, productsTable, leadsTable } from "../_lib/db.js";
import { eq, desc, count, sum, sql } from "drizzle-orm";
import { requireAdmin, cors } from "../_lib/admin-auth.js";

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
    const [orderStats] = await db.select({
      totalOrders: count(),
      totalRevenue: sum(sql`CAST(${ordersTable.total} AS NUMERIC)`),
    }).from(ordersTable);
    const [pendingCount] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "confirmed"));
    const [processingCount] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "processing"));
    const [productCount] = await db.select({ count: count() }).from(productsTable);
    const [leadCount] = await db.select({ count: count() }).from(leadsTable).where(eq(leadsTable.status, "new"));
    const recentOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(10);
    res.json({
      totalOrders: Number(orderStats.totalOrders) || 0,
      totalRevenue: Number(orderStats.totalRevenue) || 0,
      pendingOrders: Number(pendingCount.count) || 0,
      processingOrders: Number(processingCount.count) || 0,
      totalProducts: Number(productCount.count) || 0,
      newLeads: Number(leadCount.count) || 0,
      recentOrders: recentOrders.map(formatOrder),
    });
  } catch (err) {
    console.error("Failed to get admin stats", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
