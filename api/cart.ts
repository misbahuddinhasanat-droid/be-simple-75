import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, productsTable } from "./_lib/db.js";
import { eq } from "drizzle-orm";
import { cors } from "./_lib/admin-auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  // GET /api/cart
  if (req.method === "GET") {
    // Cart is handled client-side via localStorage, returning empty cart for backward compatibility
    return res.json({ items: [], total: 0, itemCount: 0 });
  }

  // POST /api/cart (originally POST /api/cart/items)
  if (req.method === "POST") {
    try {
      // Clear cart (originally POST /api/cart/clear)
      if (req.query.action === "clear") {
        return res.status(200).json({ items: [], total: 0, itemCount: 0 });
      }

      const { productId, size, color, quantity, customDesignUrl } = req.body;
      if (!productId || !size || !color || !quantity) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const db = getDb();
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, parseInt(productId)));
      if (!product) return res.status(404).json({ error: "Product not found" });

      const item = {
        itemId: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        productImageUrl: product.imageUrl,
        size, color,
        quantity: parseInt(quantity),
        price: parseFloat(product.price),
        customDesignUrl: customDesignUrl ?? null,
      };
      return res.status(201).json({ item });
    } catch (err) {
      console.error("Failed to add cart item", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // DELETE /api/cart?itemId=... (originally DELETE /api/cart/items/:id)
  if (req.method === "DELETE") {
     return res.status(200).json({ items: [], total: 0, itemCount: 0 });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
