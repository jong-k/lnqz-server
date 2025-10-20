import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { urls } from "./schema.js";

export async function createShortUrl(db: NodePgDatabase, shortCode: string, targetUrl: string) {
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
