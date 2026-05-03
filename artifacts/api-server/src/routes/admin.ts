import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, ordersTable, productsTable } from "@workspace/db";
import { eq, desc, count, sum, sql } from "drizzle-orm";

const router: IRouter = Router();

const ADMIN_KEY = "besimple2024";

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-admin-key"] || req.query["adminKey"];
  if (key !== ADMIN_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.use("/admin", requireAdmin as Parameters<typeof router.use>[0]);

// ── STATS ──────────────────────────────────────────────────────────────────
router.get("/admin/stats", async (req, res) => {
  try {
    const [orderStats] = await db
      .select({
        totalOrders: count(),
        totalRevenue: sum(sql`CAST(${ordersTable.total} AS NUMERIC)`),
      })
      .from(ordersTable);

    const [pendingCount] = await db
      .select({ count: count() })
      .from(ordersTable)
      .where(eq(ordersTable.status, "confirmed"));

    const [processingCount] = await db
      .select({ count: count() })
      .from(ordersTable)
      .where(eq(ordersTable.status, "processing"));

    const [productCount] = await db
      .select({ count: count() })
      .from(productsTable);

    const recentOrders = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt))
      .limit(10);

    res.json({
      totalOrders: Number(orderStats.totalOrders) || 0,
      totalRevenue: Number(orderStats.totalRevenue) || 0,
      pendingOrders: Number(pendingCount.count) || 0,
      processingOrders: Number(processingCount.count) || 0,
      totalProducts: Number(productCount.count) || 0,
      recentOrders: recentOrders.map(formatOrder),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── ORDERS ─────────────────────────────────────────────────────────────────
router.get("/admin/orders", async (req, res) => {
  try {
    const { status } = req.query as { status?: string };
    let orders;
    if (status && status !== "all") {
      orders = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.status, status))
        .orderBy(desc(ordersTable.createdAt));
    } else {
      orders = await db
        .select()
        .from(ordersTable)
        .orderBy(desc(ordersTable.createdAt));
    }
    res.json(orders.map(formatOrder));
  } catch (err) {
    req.log.error({ err }, "Failed to list admin orders");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid order ID" });
      return;
    }
    const { status } = req.body as { status?: string };
    const validStatuses = ["confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status", valid: validStatuses });
      return;
    }
    const [updated] = await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(formatOrder(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update order");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── PRODUCTS ───────────────────────────────────────────────────────────────
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
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }
    const { price, featured, stock, name, description } = req.body as {
      price?: number;
      featured?: boolean;
      stock?: number;
      name?: string;
      description?: string;
    };
    const updateData: Record<string, unknown> = {};
    if (price !== undefined) updateData.price = String(price);
    if (featured !== undefined) updateData.featured = featured;
    if (stock !== undefined) updateData.stock = stock;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    const [updated] = await db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(formatProduct(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    customerName: o.customerName,
    email: o.email,
    address: o.address,
    city: o.city,
    country: o.country,
    zipCode: o.zipCode,
    status: o.status,
    total: parseFloat(o.total),
    items: o.items as unknown[],
    createdAt: o.createdAt.toISOString(),
  };
}

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: parseFloat(p.price),
    imageUrl: p.imageUrl,
    category: p.category,
    sizes: p.sizes as string[],
    colors: p.colors as string[],
    featured: p.featured,
    stock: p.stock,
  };
}

export default router;
