import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getShortUrl, getTargetUrl } from "./service.js";

export const urlRoutes = async (fastify: FastifyInstance) => {
  fastify.post(
    "/api/urls",
    {
      schema: {
        summary: "단축 URL(shortUrl) 생성",
        tags: ["urls"],
        body: {
          type: "object",
          properties: {
            targetUrl: {
              type: "string",
              description: "원본 URL (https만 허용)",
              examples: ["https://example.com/path?q=1"],
            },
          },
          required: ["targetUrl"],
          additionalProperties: false,
        },
        response: {
          201: {
            description: "단축 URL 생성 성공",
            type: "object",
            properties: {
              shortUrl: { type: "string", description: "단축 URL" },
              targetUrl: { type: "string", description: "원본 URL" },
            },
            required: ["shortUrl", "targetUrl"],
            examples: [
              {
                shortUrl: `${fastify.config.BASE_URL}/a1b2C3D`,
                targetUrl: "https://example.com/path?q=1",
              },
            ],
          },
          400: {
            description: "잘못된 요청",
            type: "object",
            properties: {
              message: { type: "string" },
            },
            required: ["message"],
            examples: [{ message: "https로 시작하는 URL만 허용됩니다." }, { message: "targetUrl이 누락되었습니다." }],
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: { targetUrl: string } }>, reply: FastifyReply) => {
      const { targetUrl } = request.body;
      const result = await getShortUrl(fastify.db, fastify.config.BASE_URL, targetUrl);
      if (!result.ok) {
        reply.code(result.status ?? 500).send({ message: result.message });
        return;
      }
      reply.code(201).send({ shortUrl: result.shortUrl, targetUrl: result.targetUrl });
    }
  );

  fastify.get(
    "/:shortCode(^[0-9a-zA-Z]{7}$)",
    {
      schema: {
        summary: "단축 URL로 리다이렉트(스웨거에서는 실행 불가)",
        tags: ["urls"],
        params: {
          type: "object",
          properties: {
            shortCode: {
              type: "string",
              description: "단축 코드(7자, 알파벳 대소문자/숫자 조합)",
              minLength: 7,
              maxLength: 7,
              pattern: "^[0-9a-zA-Z]{7}$",
              examples: ["a1b2C3D"],
            },
          },
          required: ["shortCode"],
          additionalProperties: false,
        },
        response: {
          302: {
            description: "리다이렉트 성공",
            type: "null",
          },
          404: {
            description: "단축 URL을 찾을 수 없음",
            type: "object",
            properties: {
              message: { type: "string" },
            },
            required: ["message"],
            additionalProperties: false,
            examples: [{ message: "해당 단축 URL은 존재하지 않습니다." }],
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { shortCode: string } }>, reply: FastifyReply) => {
      const { shortCode } = request.params;
      const target = await getTargetUrl(fastify.db, shortCode);
      if (target) {
        reply.redirect(target);
        return;
      }
      reply.code(404).send({ message: "해당 단축 URL은 존재하지 않습니다." });
    }
  );
};
