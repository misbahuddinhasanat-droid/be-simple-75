import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, ordersTable, productsTable, settingsTable, leadsTable } from "@workspace/db";
import { eq, desc, count, sum, sql } from "drizzle-orm";

const router: IRouter = Router();
const ADMIN_KEY = "besimple2024";

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-admin-key"] || req.query["adminKey"];
  if (key !== ADMIN_KEY) { res.status(401).json({ error: "Unauthorized" }); return; }
  next();
}
router.use("/admin", requireAdmin as Parameters<typeof router.use>[0]);

// ── PUBLIC SETTINGS (only expose tracking IDs, never API keys) ─────────────
router.get("/settings", async (req, res) => {
  try {
    const rows = await db.select().from(settingsTable);
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    res.json({ gtmId: map["gtm_id"] ?? "", pixelId: map["pixel_id"] ?? "" });
  } catch (err) {
    req.log.error({ err }, "Failed to get settings");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── ADMIN STATS ─────────────────────────────────────────────────────────────
router.get("/admin/stats", async (req, res) => {
  try {
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
    req.log.error({ err }, "Failed to get admin stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── ADMIN SETTINGS ──────────────────────────────────────────────────────────
router.get("/admin/settings", async (req, res) => {
  try {
    const rows = await db.select().from(settingsTable);
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    res.json({
      gtmId: map["gtm_id"] ?? "",
      pixelId: map["pixel_id"] ?? "",
      bdcourierApiKey: map["bdcourier_api_key"] ?? "",
      pathaoClientId: map["pathao_client_id"] ?? "",
      pathaoClientSecret: map["pathao_client_secret"] ?? "",
      steadfastApiKey: map["steadfast_api_key"] ?? "",
      steadfastSecretKey: map["steadfast_secret_key"] ?? "",
      uddoktapayApiKey: map["uddoktapay_api_key"] ?? "",
      uddoktapayApiSecret: map["uddoktapay_api_secret"] ?? "",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin settings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/settings", async (req, res) => {
  try {
    const body = req.body as Record<string, string>;
    const keyMap: Record<string, string> = {
      gtmId: "gtm_id",
      pixelId: "pixel_id",
      bdcourierApiKey: "bdcourier_api_key",
      pathaoClientId: "pathao_client_id",
      pathaoClientSecret: "pathao_client_secret",
      steadfastApiKey: "steadfast_api_key",
      steadfastSecretKey: "steadfast_secret_key",
      uddoktapayApiKey: "uddoktapay_api_key",
      uddoktapayApiSecret: "uddoktapay_api_secret",
    };
    for (const [bodyKey, dbKey] of Object.entries(keyMap)) {
      if (body[bodyKey] !== undefined) {
        const val = body[bodyKey].trim();
        const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, dbKey));
        if (existing.length > 0) {
          await db.update(settingsTable).set({ value: val, updatedAt: new Date() }).where(eq(settingsTable.key, dbKey));
        } else {
          await db.insert(settingsTable).values({ key: dbKey, value: val });
        }
      }
    }
    const rows = await db.select().from(settingsTable);
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    res.json({
      gtmId: map["gtm_id"] ?? "", pixelId: map["pixel_id"] ?? "",
      bdcourierApiKey: map["bdcourier_api_key"] ?? "",
      pathaoClientId: map["pathao_client_id"] ?? "", pathaoClientSecret: map["pathao_client_secret"] ?? "",
      steadfastApiKey: map["steadfast_api_key"] ?? "", steadfastSecretKey: map["steadfast_secret_key"] ?? "",
      uddoktapayApiKey: map["uddoktapay_api_key"] ?? "", uddoktapayApiSecret: map["uddoktapay_api_secret"] ?? "",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update settings");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── FRAUD CHECK (BD Courier API) ────────────────────────────────────────────
router.get("/admin/fraud-check", async (req, res) => {
  try {
    const phone = (req.query.phone as string)?.replace(/\s/g, "");
    if (!phone || !/^01[3-9]\d{8}$/.test(phone)) {
      res.status(400).json({ error: "Invalid Bangladesh phone number" }); return;
    }
    const rows = await db.select().from(settingsTable).where(eq(settingsTable.key, "bdcourier_api_key"));
    const apiKey = rows[0]?.value;
    if (!apiKey) {
      res.status(400).json({ error: "BD Courier API key not configured. Go to Settings to add it." }); return;
    }
    const bdRes = await fetch(`https://portal.packzy.com/api/v1/fraud_check/${phone}`, {
      headers: { "Api-Key": apiKey, "Secret-Key": apiKey, "Content-Type": "application/json" },
    });
    if (!bdRes.ok) {
      // Try alternative BD Courier endpoint
      const alt = await fetch(`https://app.bdcourier.com/api/v1/merchant/check-customer`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!alt.ok) {
        res.status(alt.status).json({ error: `BD Courier API error: ${alt.status}` }); return;
      }
      const data = await alt.json() as {
        success?: boolean;
        data?: { total_order?: number; cancel_order?: number; cancel_rate?: number; grade?: string };
      };
      if (!data.success) { res.status(400).json({ error: "BD Courier returned error" }); return; }
      res.json(formatFraudResult(phone, data.data ?? {}));
    } else {
      const data = await bdRes.json() as {
        total_order?: number; cancel_order?: number; cancel_rate?: number; grade?: string;
        current_order?: number;
      };
      res.json(formatFraudResult(phone, data));
    }
  } catch (err) {
    req.log.error({ err }, "Failed to check fraud");
    res.status(500).json({ error: "Failed to reach BD Courier API. Check your API key and network." });
  }
});

function formatFraudResult(phone: string, data: Record<string, unknown>) {
  const totalOrder = Number(data.total_order ?? data.total ?? 0);
  const cancelOrder = Number(data.cancel_order ?? data.cancelled ?? 0);
  const cancelRate = totalOrder > 0 ? Math.round((cancelOrder / totalOrder) * 100) : 0;
  let grade = String(data.grade ?? "");
  if (!grade) {
    if (cancelRate === 0) grade = "A+";
    else if (cancelRate < 10) grade = "A";
    else if (cancelRate < 25) grade = "B";
    else if (cancelRate < 50) grade = "C";
    else if (cancelRate < 75) grade = "D";
    else grade = "F";
  }
  return { phone, totalOrder, cancelOrder, cancelRate, grade };
}

// ── ADMIN ORDERS ────────────────────────────────────────────────────────────
router.get("/admin/orders", async (req, res) => {
  try {
    const { status } = req.query as { status?: string };
    const orders = status && status !== "all"
      ? await db.select().from(ordersTable).where(eq(ordersTable.status, status)).orderBy(desc(ordersTable.createdAt))
      : await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    res.json(orders.map(formatOrder));
  } catch (err) {
    req.log.error({ err }, "Failed to list admin orders");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid order ID" }); return; }
    const { status } = req.body as { status?: string };
    const valid = ["confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!status || !valid.includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
    const [updated] = await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Order not found" }); return; }
    res.json(formatOrder(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update order");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── ADMIN PRODUCTS ──────────────────────────────────────────────────────────
router.get("/admin/products", async (req, res) => {
  try {
    const products = await db.select().from(productsTable);
    res.json(products.map(formatProduct));
  } catch (err) {
    req.log.error({ err }, "Failed to list admin products");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid product ID" }); return; }
    const { price, featured, stock, name, description } = req.body as {
      price?: number; featured?: boolean; stock?: number; name?: string; description?: string;
    };
    const updateData: Record<string, unknown> = {};
    if (price !== undefined) updateData.price = String(price);
    if (featured !== undefined) updateData.featured = featured;
    if (stock !== undefined) updateData.stock = stock;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (Object.keys(updateData).length === 0) { res.status(400).json({ error: "No fields to update" }); return; }
    const [updated] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Product not found" }); return; }
    res.json(formatProduct(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── ADMIN LEADS ─────────────────────────────────────────────────────────────
router.get("/admin/leads", async (req, res) => {
  try {
    const { status } = req.query as { status?: string };
    const leads = status && status !== "all"
      ? await db.select().from(leadsTable).where(eq(leadsTable.status, status)).orderBy(desc(leadsTable.createdAt))
      : await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));
    res.json(leads.map(formatLead));
  } catch (err) {
    req.log.error({ err }, "Failed to list leads");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/leads/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid lead ID" }); return; }
    const { status, notes } = req.body as { status?: string; notes?: string };
    const valid = ["new", "called", "converted", "not_interested"];
    const updateData: Record<string, unknown> = {};
    if (status && valid.includes(status)) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (Object.keys(updateData).length === 0) { res.status(400).json({ error: "No fields to update" }); return; }
    const [updated] = await db.update(leadsTable).set(updateData).where(eq(leadsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Lead not found" }); return; }
    res.json(formatLead(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update lead");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── FORMATTERS ──────────────────────────────────────────────────────────────
function formatOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id, customerName: o.customerName, email: o.email,
    address: o.address, city: o.city, country: o.country, zipCode: o.zipCode,
    status: o.status, total: parseFloat(o.total),
    items: o.items as unknown[], createdAt: o.createdAt.toISOString(),
  };
}
function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id, name: p.name, description: p.description, price: parseFloat(p.price),
    imageUrl: p.imageUrl, category: p.category, sizes: p.sizes as string[],
    colors: p.colors as string[], featured: p.featured, stock: p.stock,
  };
}
function formatLead(l: typeof leadsTable.$inferSelect) {
  return {
    id: l.id, phone: l.phone, name: l.name, email: l.email,
    cartItems: l.cartItems as unknown[], cartTotal: parseFloat(l.cartTotal),
    status: l.status, notes: l.notes, createdAt: l.createdAt.toISOString(),
  };
}

export default router;
