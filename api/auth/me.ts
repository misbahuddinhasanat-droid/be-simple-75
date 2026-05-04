import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, usersTable } from "../_lib/db.js";
import { verifyToken } from "../_lib/auth-utils.js";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    const db = getDb();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, decoded.userId)).limit(1);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      city: user.city,
      zipCode: user.zipCode
    });
  } catch (err) {
    console.error("Auth Me error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
