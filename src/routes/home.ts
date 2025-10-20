import type { FastifyInstance } from "fastify";

const plugin = async (fastify: FastifyInstance) => {
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
};

export default plugin;
