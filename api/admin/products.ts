import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, productsTable } from "../_lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin, cors } from "../_lib/admin-auth";

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
  if (!requireAdmin(req, res)) return;

  const db = getDb();

  // GET /api/admin/products
  if (req.method === "GET") {
    try {
      const products = await db.select().from(productsTable);
      return res.json(products.map(formatProduct));
    } catch (err) {
      console.error("Failed to list admin products", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // PATCH /api/admin/products?id=X
  if (req.method === "PATCH") {
    try {
      const id = parseInt(req.query.id as string);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid product ID" });
      const { price, featured, stock, name, description } = req.body;
      const updateData: Record<string, unknown> = {};
      if (price !== undefined) updateData.price = String(price);
      if (featured !== undefined) updateData.featured = featured;
      if (stock !== undefined) updateData.stock = stock;
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (Object.keys(updateData).length === 0) return res.status(400).json({ error: "No fields to update" });

      const [updated] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, id)).returning();
      if (!updated) return res.status(404).json({ error: "Product not found" });
      return res.json(formatProduct(updated));
    } catch (err) {
      console.error("Failed to update product", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
