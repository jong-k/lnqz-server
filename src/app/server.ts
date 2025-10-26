import { migrate } from "drizzle-orm/node-postgres/migrator";
import Fastify from "fastify";
import fs from "node:fs";
import path from "node:path";
import { corsPlugin } from "./plugins/cors.js";
import { dbPlugin } from "./plugins/db.js";
import { envPlugin } from "./plugins/env.js";
import { swaggerPlugin } from "./plugins/swagger.js";
import { routes } from "./routes.js";

const getLoggerOptions = () => {
  const env = process.env.NODE_ENV ?? "development";
  if (env !== "production") {
    return {
      level: "debug",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          singleLine: true,
          translateTime: "SYS:HH:MM:ss.l",
          ignore: "pid,hostname",
        },
      },
    } as const;
  }
  return {
    level: "info",
  } as const;
};

export const buildServer = async () => {
  const fastify = Fastify({
    logger: getLoggerOptions(),
    trustProxy: ["127.0.0.1", "::1"],
  });

  await fastify.register(envPlugin);
  await fastify.register(dbPlugin);
  // Run DB migrations at boot
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
  await fastify.register(swaggerPlugin);
  await fastify.register(corsPlugin);
  await fastify.register(routes);

  return fastify;
};
