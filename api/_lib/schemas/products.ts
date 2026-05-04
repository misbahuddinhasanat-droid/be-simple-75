import { pgTable, serial, text, decimal, boolean, integer, jsonb } from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url").notNull(),
  gallery: jsonb("gallery"),
  category: text("category").notNull().default("tshirt"),
  sizes: jsonb("sizes").notNull().default(["S", "M", "L", "XL", "XXL"]),
  colors: jsonb("colors").notNull().default(["White", "Black", "Gray"]),
  featured: boolean("featured").notNull().default(false),
  stock: integer("stock").notNull().default(100),
  sku: text("sku"),
  customAttributes: jsonb("custom_attributes"),
});

export type InsertProduct = typeof productsTable.$inferInsert;
export type Product = typeof productsTable.$inferSelect;
