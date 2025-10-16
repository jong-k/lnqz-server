import Fastify from "fastify";
import Swagger from "@fastify/swagger";
import SwaggerUI from "@fastify/swagger-ui";
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

const fastify = Fastify({
  logger: getLoggerOptions(),
});

fastify.register(Swagger, {
  openapi: {
    info: {
      title: "Link Squeeze API",
      description: "API documentation for Link Squeeze URL shortener service",
      version: "1.0.0",
    },
    servers: [{ url: "http://localhost:3000", description: "Local server" }],
  },
});

fastify.register(SwaggerUI, {
  routePrefix: "/docs",
  staticCSP: true,
  uiConfig: {
    docExpansion: "list",
    deepLinking: false,
  },
});

fastify.register(routes);

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
};

start();
