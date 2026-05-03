import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

interface CartItemData {
  itemId: string;
  productId: number;
  productName: string;
  productImageUrl: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  customDesignUrl?: string | null;
}

// In-memory cart per session (keyed by session cookie or client IP)
const carts = new Map<string, CartItemData[]>();

function getSessionKey(req: Parameters<Parameters<typeof router.get>[1]>[0]): string {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string" ? forwarded.split(",")[0] : req.socket.remoteAddress ?? "default";
  return `cart:${ip}`;
}

function buildCart(items: CartItemData[]) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    items,
    total: parseFloat(total.toFixed(2)),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

router.get("/cart", (req, res) => {
  const key = getSessionKey(req);
  const items = carts.get(key) ?? [];
  res.json(buildCart(items));
});

router.post("/cart/items", async (req, res) => {
  try {
    const { productId, size, color, quantity, customDesignUrl } = req.body;
    if (!productId || !size || !color || !quantity) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, parseInt(productId)));
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const key = getSessionKey(req);
    const items = carts.get(key) ?? [];

    const newItem: CartItemData = {
      itemId: randomUUID(),
      productId: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl,
      size,
      color,
      quantity: parseInt(quantity),
      price: parseFloat(product.price),
      customDesignUrl: customDesignUrl ?? null,
    };

    items.push(newItem);
    carts.set(key, items);
    res.status(201).json(buildCart(items));
  } catch (err) {
    req.log.error({ err }, "Failed to add cart item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/cart/items/:itemId", (req, res) => {
  const key = getSessionKey(req);
  const items = (carts.get(key) ?? []).filter(i => i.itemId !== req.params.itemId);
  carts.set(key, items);
  res.json(buildCart(items));
});

router.post("/cart/clear", (req, res) => {
  const key = getSessionKey(req);
  carts.set(key, []);
  res.json(buildCart([]));
});

export default router;
