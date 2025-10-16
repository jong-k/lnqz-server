import Fastify from "fastify";
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
