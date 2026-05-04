import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, productsTable } from "../_lib/db";
import { eq } from "drizzle-orm";
import { cors } from "../_lib/admin-auth";

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id, name: p.name, description: p.description, price: parseFloat(p.price),
    imageUrl: p.imageUrl, category: p.category, sizes: p.sizes as string[],
    colors: p.colors as string[], featured: p.featured, stock: p.stock,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const db = getDb();

  // POST /api/cart/items — add to cart (now handled client-side, this is a passthrough that looks up product info)
  if (req.method === "POST") {
    try {
      const { productId, size, color, quantity, customDesignUrl } = req.body;
      if (!productId || !size || !color || !quantity) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, parseInt(productId)));
      if (!product) return res.status(404).json({ error: "Product not found" });

      // Return product data for the client to store in localStorage
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

  return res.status(405).json({ error: "Method not allowed" });
}
