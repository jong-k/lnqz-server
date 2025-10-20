import type { FastifyPluginAsync } from "fastify";

const plugin: FastifyPluginAsync = async fastify => {
  fastify.get(
    "/",
    {
      schema: {
        summary: "",
        response: {
          200: {
            description: "",
            type: "object",
            properties: {
              message: { type: "string", description: "" },
            },
            required: ["message"],
            additionalProperties: false,
          },
        },
      },
    },
    async (_request, reply) => {
      reply.send({ message: "Welcome to the Link Squeeze API" });
    }
  );

  fastify.get(
    "/api",
    {
      schema: {
        summary: "",
        response: {
          200: {
            description: "",
            type: "object",
            properties: {
              message: { type: "string", description: "" },
            },
            required: ["message"],
            additionalProperties: false,
          },
        },
      },
    },
    async ({ protocol, hostname }, reply) => {
      const port = fastify.config.PORT;
      reply.send({
        message: `See documentation at ${protocol}://${hostname}:${port}/docs`,
      });
    }
  );

  fastify.get(
    "/health",
    {
      schema: {
        summary: "서버 상태 확인",
        response: {
          200: {
            description: "서버가 정상적으로 작동 중임을 나타냄",
          },
        },
      },
    },
    async (_request, reply) => {
      reply.code(200);
    }
  );
};

export default plugin;
