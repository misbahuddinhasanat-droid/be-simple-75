import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Must match Vercel env `ADMIN_KEY` and `/api/.env`; frontend login uses Besimple90@@ by default. */
const ADMIN_KEY = process.env.ADMIN_KEY || "Besimple90@@";

export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const key = req.headers["x-admin-key"] || req.query["adminKey"];
  if (key !== ADMIN_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

export function cors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-key");
}
