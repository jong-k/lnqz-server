import type { FastifyInstance } from "fastify";

export default async function routes(fastify: FastifyInstance) {
  fastify.get("/", async () => {
    return { hello: "world" };
  });

  fastify.get("/health", async (_request, reply) => {
    reply.code(200).send();
  });

  fastify.post("/api/urls", async request => {
    return request.body;
  });
}
