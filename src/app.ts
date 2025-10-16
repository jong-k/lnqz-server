import Fastify from "fastify";
import routes from "./routes/index.js";

const server = Fastify({ logger: true });

server.register(routes);

const start = async () => {
  try {
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
};

start();
