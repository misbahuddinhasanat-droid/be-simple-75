import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, categoriesTable } from "../_lib/db.js";
import { auth, cors } from "../_lib/admin-auth.js";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  
  if (!auth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const db = getDb();

  try {
    if (req.method === "GET") {
      const all = await db.select().from(categoriesTable);
      return res.json(all);
    }

    if (req.method === "POST") {
      const { name, slug } = req.body;
      if (!name || !slug) return res.status(400).json({ error: "Missing fields" });
      
      const [inserted] = await db.insert(categoriesTable).values({ name, slug }).returning();
      return res.status(201).json(inserted);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Missing ID" });
      
      await db.delete(categoriesTable).where(eq(categoriesTable.id, parseInt(id as string)));
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Category API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
