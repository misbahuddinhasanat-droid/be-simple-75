import { pgTable, serial, text, decimal, jsonb, timestamp } from "drizzle-orm/pg-core";

export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  name: text("name").notNull().default(""),
  email: text("email").notNull().default(""),
  cartItems: jsonb("cart_items").notNull().default([]),
  cartTotal: decimal("cart_total", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("new"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Lead = typeof leadsTable.$inferSelect;
