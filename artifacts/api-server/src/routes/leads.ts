import { Router, type IRouter } from "express";
import { db, leadsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Public: save/update a lead (called from checkout form)
router.post("/leads", async (req, res) => {
  try {
    const { phone, name, email, cartItems, cartTotal } = req.body as {
      phone: string;
      name?: string;
      email?: string;
      cartItems?: unknown[];
      cartTotal?: number;
    };

    if (!phone || !/^01[3-9]\d{8}$/.test(phone.replace(/\s/g, ""))) {
      res.status(400).json({ error: "Invalid Bangladesh phone number" });
      return;
    }

    const cleanPhone = phone.replace(/\s/g, "");

    // Upsert: update if phone already exists (same session), otherwise insert
    const existing = await db
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.phone, cleanPhone))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(leadsTable)
        .set({
          name: name ?? existing[0].name,
          email: email ?? existing[0].email,
          cartItems: (cartItems ?? existing[0].cartItems) as unknown[],
          cartTotal: String(cartTotal ?? existing[0].cartTotal),
        })
        .where(eq(leadsTable.phone, cleanPhone));
    } else {
      await db.insert(leadsTable).values({
        phone: cleanPhone,
        name: name ?? "",
        email: email ?? "",
        cartItems: (cartItems ?? []) as unknown[],
        cartTotal: String(cartTotal ?? 0),
        status: "new",
        notes: "",
      });
    }

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to save lead");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
