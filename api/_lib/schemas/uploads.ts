import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const uploadsTable = pgTable("uploads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Upload = typeof uploadsTable.$inferSelect;
