import Fastify from "fastify";
import routes from "./routes/index.js";

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
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
