import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors } from "./_lib/admin-auth";

export default function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  res.json({ status: "ok" });
}
