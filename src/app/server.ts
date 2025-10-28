import Fastify from "fastify";
import pino from "pino";
import { corsPlugin } from "./plugins/cors.js";
import { dbPlugin } from "./plugins/db.js";
import { envPlugin } from "./plugins/env.js";
import { swaggerPlugin } from "./plugins/swagger.js";
import { routes } from "./routes.js";

const getLoggerOptions = () => {
  const env = process.env.NODE_ENV ?? "development";
  if (env !== "production") {
    return {
      level: "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:HH:MM:ss.l",
          ignore: "pid,hostname",
        },
      },
    } as const;
  }
  return {
    level: "info",
    timestamp: pino.stdTimeFunctions.isoTime,
  } as const;
};

export const buildServer = async () => {
  const fastify = Fastify({
    logger: getLoggerOptions(),
    trustProxy: ["127.0.0.1", "::1"],
  });

  await fastify.register(envPlugin);
  await fastify.register(dbPlugin);
  await fastify.register(swaggerPlugin);
  await fastify.register(corsPlugin);

  fastify.addHook("onRequest", (request, _reply, done) => {
    fastify.log.warn({
      url: request.url,
      host: request.headers.host,
      origin: request.headers.origin,
      referer: request.headers.referer,
    });
    done();
  });
  await fastify.register(routes);

  return fastify;
};
