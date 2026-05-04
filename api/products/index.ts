import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, productsTable } from "./_lib/db";
import { eq } from "drizzle-orm";
import { cors } from "./_lib/admin-auth";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const db = getDb();
    const { category } = req.query as { category?: string };
    let products;
    if (category) {
      products = await db.select().from(productsTable).where(eq(productsTable.category, category));
    } else {
      products = await db.select().from(productsTable);
    }
    res.json(products.map(formatProduct));
  } catch (err) {
    console.error("Failed to list products", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
