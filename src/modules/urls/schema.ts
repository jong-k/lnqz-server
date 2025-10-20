import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const urls = pgTable("urls", {
  id: serial("id").primaryKey(),
  shortCode: varchar("short_code", { length: 7 }).notNull().unique(),
  targetUrl: text("target_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export type Url = typeof urls.$inferSelect;
export type NewUrl = typeof urls.$inferInsert;
