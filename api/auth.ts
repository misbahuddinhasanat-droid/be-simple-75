import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, usersTable } from "./_lib/db.js";
import { hashPassword, comparePassword, generateToken, verifyToken } from "./_lib/auth-utils.js";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action || req.url?.split("/").pop()?.split("?")[0];

  const db = getDb();

  // ─── REGISTER ──────────────────────────────────────────────────────────────
  if (action === "register" && req.method === "POST") {
    try {
      const { email, password, name, phone } = req.body;
      const hashedPassword = await hashPassword(password);
      const [user] = await db.insert(usersTable).values({
        email, name, phone, password: hashedPassword,
      }).returning();
      const token = generateToken(user.id);
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      return res.status(400).json({ error: "Email already exists or invalid data" });
    }
  }

  // ─── LOGIN ─────────────────────────────────────────────────────────────────
  if (action === "login" && req.method === "POST") {
    try {
      const { email, password } = req.body;
      const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (!user || !(await comparePassword(password, user.password))) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const token = generateToken(user.id);
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      return res.status(500).json({ error: "Login failed" });
    }
  }

  // ─── ME (VERIFY) ───────────────────────────────────────────────────────────
  if (action === "me") {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) return res.status(401).json({ error: "Unauthorized" });

    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, decoded.userId)).limit(1);
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json({ id: user.id, email: user.email, name: user.name });
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch user" });
    }
  }

  return res.status(404).json({ error: "Auth action not found" });
}
