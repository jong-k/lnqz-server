import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const urls = pgTable("urls", {
  id: serial("id").primaryKey(),
  shortCode: varchar("short_code", { length: 7 }).notNull().unique(),
  targetUrl: text("target_url").notNull(),
  clicks: integer("clicks").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export type Url = typeof urls.$inferSelect;
export type NewUrl = typeof urls.$inferInsert;
