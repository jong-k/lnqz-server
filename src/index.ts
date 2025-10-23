import { buildServer } from "./app/server.js";

const init = async () => {
  try {
    const fastify = await buildServer();
    const port = fastify.config.PORT;
    await fastify.listen({ port: Number(port) });
  } catch (err) {
    console.error(err);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
};

init();
