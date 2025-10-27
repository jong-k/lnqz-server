import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import fp from "fastify-plugin";
import fs from "node:fs";
import path from "node:path";
import fastifyPostgres from "@fastify/postgres";

declare module "fastify" {
  interface FastifyInstance {
    db: NodePgDatabase;
  }
}

export const dbPlugin = fp(async fastify => {
  const connectionString = fastify.config.DATABASE_URL;
  try {
    await fastify.register(fastifyPostgres, { connectionString });
    await fastify.pg.pool.query("SELECT 1");
    fastify.log.info("Postgres 연결 성공");
  } catch (err) {
    fastify.log.error("Postgres 연결 실패");
    throw err;
  }

  const db = drizzle(fastify.pg.pool);
  fastify.decorate("db", db);
  try {
    const drizzleMigrationsPath = path.resolve(process.cwd(), "src/infra/db/drizzle");
    const migrationsFolder = fs.existsSync(drizzleMigrationsPath) ? drizzleMigrationsPath : null;
    if (!migrationsFolder) {
      fastify.log.warn("마이그레이션 폴더를 찾을 수 없습니다. 스킵합니다.");
    } else {
      fastify.log.info({ migrationsFolder }, "마이그레이션 실행 시작");
      await migrate(fastify.db, { migrationsFolder });
      fastify.log.info("마이그레이션 실행 완료");
    }
  } catch (err) {
    fastify.log.error({ err }, "마이그레이션 실행 실패");
    throw err;
  }
});
