import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors } from "./_lib/admin-auth";

// Cart is now handled entirely client-side via localStorage
// This endpoint returns an empty cart for backward compatibility
export default function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  res.json({ items: [], total: 0, itemCount: 0 });
}
