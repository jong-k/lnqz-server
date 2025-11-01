import { FastifyInstance } from "fastify";
import { urlRoutes } from "../modules/url/routes.js";

const defaultRoutes = (fastify: FastifyInstance) => {
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

export const routes = async (fastify: FastifyInstance) => {
  await fastify.register(defaultRoutes);
  await fastify.register(urlRoutes);
};
