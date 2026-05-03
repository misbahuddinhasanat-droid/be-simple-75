import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateOrderBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/orders", async (req, res) => {
  try {
    const parsed = CreateOrderBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const { customerName, email, address, city, country, zipCode, items } = parsed.data;

    const total = (items as Array<{ price?: number; quantity: number }>).reduce((sum, item) => {
      return sum + ((item.price ?? 0) * item.quantity);
    }, 0);

    const [order] = await db.insert(ordersTable).values({
      customerName,
      email,
      address,
      city,
      country,
      zipCode,
      status: "confirmed",
      total: total.toFixed(2),
      items: items as unknown[],
    }).returning();

    res.status(201).json(formatOrder(order));
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid order ID" });
      return;
    }
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(formatOrder(order));
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
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

export default router;
