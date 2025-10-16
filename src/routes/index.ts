import type { FastifyInstance, FastifyRequest } from "fastify";

export default async function routes(fastify: FastifyInstance) {
  fastify.get("/", async () => {
    return { hello: "world" };
  });

  fastify.get("/health", async (_request, reply) => {
    reply.code(200).send();
  });

  fastify.post(
    "/api/urls",
    {
      schema: {
        summary: "단축된 URL(code) 생성",
        tags: ["urls"],
        body: {
          type: "object",
          properties: {
            targetUrl: { type: "string", description: "원본 URL" },
          },
          required: ["targetUrl"],
          additionalProperties: false,
        },
        response: {
          200: {
            type: "object",
            properties: {
              code: { type: "string", description: "단축된 URL" },
              targetUrl: { type: "string", description: "원본 URL" },
            },
            required: ["code", "targetUrl"],
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: { targetUrl: string } }>) => {
      return {
        code: request.body.targetUrl,
        targetUrl: request.body.targetUrl,
      };
    }
  );
}
