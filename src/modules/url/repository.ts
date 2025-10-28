import { eq, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { urls } from "./schema.js";

export async function createShortCode(db: NodePgDatabase, shortCode: string, targetUrl: string) {
  const inserted = await db
    .insert(urls)
    .values({ shortCode, targetUrl })
    .onConflictDoNothing({ target: urls.shortCode })
    .returning();
  return inserted[0] ?? null;
}

export async function getTargetUrlByShortCode(db: NodePgDatabase, shortCode: string) {
  const rows = await db.select({ targetUrl: urls.targetUrl }).from(urls).where(eq(urls.shortCode, shortCode)).limit(1);
  return rows[0]?.targetUrl ?? null;
}

export async function incrementClicksByShortCode(db: NodePgDatabase, shortCode: string) {
  await db
    .update(urls)
    .set({ clicks: sql`${urls.clicks} + 1` })
    .where(eq(urls.shortCode, shortCode));
}

export async function getUrlByShortCode(db: NodePgDatabase, shortCode: string) {
  const rows = await db.select().from(urls).where(eq(urls.shortCode, shortCode)).limit(1);
  return rows[0] ?? null;
}
