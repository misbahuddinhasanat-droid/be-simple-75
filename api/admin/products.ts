import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, productsTable, categoriesTable } from "../_lib/db.js";
import { eq } from "drizzle-orm";
import { requireAdmin, cors } from "../_lib/admin-auth.js";

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id, name: p.name, description: p.description, shortDescription: p.shortDescription,
    price: parseFloat(p.price), salePrice: p.salePrice ? parseFloat(p.salePrice) : null,
    imageUrl: p.imageUrl, gallery: (p.gallery as string[]) || [],
    category: p.category, sizes: p.sizes as string[],
    colors: p.colors as string[], featured: p.featured, stock: p.stock,
    sku: p.sku || "",
    customAttributes: p.customAttributes || {},
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  const db = getDb();
  const target = req.query.target;

  // ─── CATEGORY MANAGEMENT ───────────────────────────────────────────────────
  if (target === "categories") {
    try {
      if (req.method === "GET") {
        const all = await db.select().from(categoriesTable);
        return res.json(all);
      }
      if (req.method === "POST") {
        const { name, slug } = req.body;
        const [inserted] = await db.insert(categoriesTable).values({ name, slug }).returning();
        return res.status(201).json(inserted);
      }
      if (req.method === "DELETE") {
        const id = parseInt(req.query.id as string);
        await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
        return res.status(204).end();
      }
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // ─── PRODUCT MANAGEMENT ────────────────────────────────────────────────────

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

  // POST /api/admin/products
  if (req.method === "POST") {
    try {
      const { name, description, shortDescription, price, salePrice, imageUrl, gallery, category, sizes, colors, featured, stock, sku, customAttributes } = req.body;
      if (!name || !description || price === undefined || !imageUrl) {
        return res.status(400).json({ error: "Missing required fields: name, description, price, imageUrl" });
      }

      const [product] = await db.insert(productsTable).values({
        name,
        description,
        shortDescription: shortDescription || null,
        price: String(price),
        salePrice: salePrice ? String(salePrice) : null,
        imageUrl,
        gallery: gallery || null,
        category: category || "tshirt",
        sizes: sizes || ["S", "M", "L", "XL", "XXL"],
        colors: colors || ["White", "Black"],
        featured: !!featured,
        stock: stock !== undefined ? Number(stock) : 100,
        sku: sku || null,
        customAttributes: customAttributes || {},
      }).returning();

      return res.status(201).json(formatProduct(product));
    } catch (err) {
      console.error("Failed to create product", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // PATCH /api/admin/products?id=X
  if (req.method === "PATCH") {
    try {
      const id = parseInt(req.query.id as string);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid product ID" });
      const { name, description, shortDescription, price, salePrice, imageUrl, gallery, category, sizes, colors, featured, stock, sku, customAttributes } = req.body;
      
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
      if (price !== undefined) updateData.price = String(price);
      if (salePrice !== undefined) updateData.salePrice = salePrice === null ? null : String(salePrice);
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (gallery !== undefined) updateData.gallery = gallery;
      if (category !== undefined) updateData.category = category;
      if (sizes !== undefined) updateData.sizes = sizes;
      if (colors !== undefined) updateData.colors = colors;
      if (featured !== undefined) updateData.featured = !!featured;
      if (stock !== undefined) updateData.stock = Number(stock);
      if (sku !== undefined) updateData.sku = sku;
      if (customAttributes !== undefined) updateData.customAttributes = customAttributes;

      if (Object.keys(updateData).length === 0) return res.status(400).json({ error: "No fields to update" });

      const [updated] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, id)).returning();
      if (!updated) return res.status(404).json({ error: "Product not found" });
      return res.json(formatProduct(updated));
    } catch (err) {
      console.error("Failed to update product", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // DELETE /api/admin/products?id=X
  if (req.method === "DELETE") {
    try {
      const id = parseInt(req.query.id as string);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid product ID" });
      
      const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
      if (!deleted) return res.status(404).json({ error: "Product not found" });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Failed to delete product", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
