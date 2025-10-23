import Fastify from "fastify";
import { dbPlugin } from "./plugins/db.js";
import { envPlugin } from "./plugins/env.js";
import { swaggerPlugin } from "./plugins/swagger.js";
import { routes } from "./routes.js";

const loggerOptions = {
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

export const buildServer = async () => {
  const fastify = Fastify({
    logger: loggerOptions,
  });

  await fastify.register(envPlugin);
  await fastify.register(dbPlugin);
  await fastify.register(swaggerPlugin);
  await fastify.register(routes);

  return fastify;
};
