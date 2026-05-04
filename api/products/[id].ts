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
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const id = parseInt(req.query.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid product ID" });
    
    const db = getDb();
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(formatProduct(product));
  } catch (err) {
    console.error("Failed to get product", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
