import { pgTable, serial, text, decimal, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull().default("tshirt"),
  sizes: jsonb("sizes").notNull().default(["S", "M", "L", "XL", "XXL"]),
  colors: jsonb("colors").notNull().default(["White", "Black", "Gray"]),
  featured: boolean("featured").notNull().default(false),
  stock: integer("stock").notNull().default(100),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
