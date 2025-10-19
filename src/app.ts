import Fastify from "fastify";
import { access } from "node:fs/promises";
import { join } from "node:path";
import fastifyPostgres from "@fastify/postgres";
import Swagger from "@fastify/swagger";
import SwaggerUI from "@fastify/swagger-ui";
import envPlugin from "./plugins/external/env.js";
import routes from "./routes/index.js";

const getLoggerOptions = () => {
  if (process.env.NODE_ENV !== "production") {
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
    };
  }
  return false;
};

async function buildServer() {
  const fastify = Fastify({
    logger: getLoggerOptions(),
  });

  if (process.env.NODE_ENV !== "production") {
    try {
      await access(join(process.cwd(), ".env"));
    } catch {
      throw new Error(".env 파일이 필요합니다.");
    }
  }

  await fastify.register(envPlugin);

  const connectionString = fastify.config.DATABASE_URL;
  try {
    await fastify.register(fastifyPostgres, { connectionString });
    await fastify.pg.pool.query("SELECT 1");
    fastify.log.info("Postgres 연결 성공");
  } catch (err) {
    fastify.log.error("Postgres 연결 실패");
    throw err;
  }

  await fastify.register(Swagger, {
    openapi: {
      info: {
        title: "Link Squeeze API",
        description: "API documentation for Link Squeeze URL shortener service",
        version: "1.0.0",
      },
      servers: [{ url: "http://localhost:3000", description: "Local server" }],
    },
  });

  await fastify.register(SwaggerUI, {
    routePrefix: "/docs",
    staticCSP: true,
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  });

  await fastify.register(routes);

  return fastify;
}

const start = async () => {
  try {
    const fastify = await buildServer();
    const port = fastify.config.PORT;
    await fastify.listen({ port });
  } catch (err) {
    console.error(err);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
};

start();
