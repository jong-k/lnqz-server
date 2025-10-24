import Fastify from "fastify";
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
  });

  await fastify.register(envPlugin);
  await fastify.register(dbPlugin);
  await fastify.register(swaggerPlugin);
  await fastify.register(corsPlugin);
  await fastify.register(routes);

  return fastify;
};
