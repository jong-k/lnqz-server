import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import fp from "fastify-plugin";
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
});
