import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, productsTable } from "./_lib/db.js";
import { eq } from "drizzle-orm";
import { cors } from "./_lib/admin-auth.js";

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id, name: p.name, description: p.description, shortDescription: p.shortDescription,
    price: parseFloat(p.price), salePrice: p.salePrice ? parseFloat(p.salePrice) : null,
    imageUrl: p.imageUrl, gallery: (p.gallery as string[]) || [],
    category: p.category, sizes: p.sizes as string[],
    colors: p.colors as string[], featured: p.featured, stock: p.stock,
    customAttributes: p.customAttributes || {},
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const db = getDb();
    const rawId = req.query.id as string | undefined;
    const featured = req.query.featured as string | undefined;
    const category = req.query.category as string | undefined;

    // GET /api/products?id=X → single product
    if (rawId) {
      const id = parseInt(rawId);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid product ID" });
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
      if (!product) return res.status(404).json({ error: "Product not found" });
      return res.json(formatProduct(product));
    }

    // GET /api/products?featured=true → featured products
    if (featured === "true") {
      const products = await db.select().from(productsTable).where(eq(productsTable.featured, true));
      return res.json(products.map(formatProduct));
    }

    // GET /api/products?category=X → filtered by category
    if (category) {
      const products = await db.select().from(productsTable).where(eq(productsTable.category, category));
      return res.json(products.map(formatProduct));
    }

    // GET /api/products → all products
    const products = await db.select().from(productsTable);
    res.json(products.map(formatProduct));
  } catch (err) {
    console.error("Failed to handle products", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
