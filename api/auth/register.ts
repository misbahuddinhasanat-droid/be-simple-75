import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, usersTable } from "../_lib/db.js";
import { hashPassword, generateToken } from "../_lib/auth-utils.js";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password, name, phone } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required" });
  }

  try {
    const db = getDb();
    
    // Check if user exists
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const hashedPassword = await hashPassword(password);
    
    const [user] = await db.insert(usersTable).values({
      email,
      password: hashedPassword,
      name,
      phone: phone || null,
    }).returning();

    const token = generateToken(user.id);

    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone }
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Failed to register user" });
  }
}
