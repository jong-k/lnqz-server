import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getShortCode, getTargetUrl, getUrlInfo, recordClick } from "./service.js";

export const urlRoutes = async (fastify: FastifyInstance) => {
  fastify.post(
    "/urls",
    {
      schema: {
        summary: "단축 코드(shortCode) 생성",
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
            description: "단축 코드 생성 성공",
            type: "object",
            properties: {
              shortCode: { type: "string", description: "단축 코드" },
              targetUrl: { type: "string", description: "원본 URL" },
            },
            required: ["shortCode", "targetUrl"],
            examples: [
              {
                shortCode: `a1b2C3D`,
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
      const result = await getShortCode(fastify.db, targetUrl);
      if (!result.ok) {
        reply.code(result.status ?? 500).send({ message: result.message });
        return;
      }
      reply.code(201).send(result.data);
    }
  );

  fastify.get(
    "/urls/:shortCode",
    {
      schema: {
        summary: "단축 URL 상세 조회",
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
          200: {
            description: "조회 성공",
            type: "object",
            properties: {
              shortCode: { type: "string", description: "단축 코드" },
              targetUrl: { type: "string", description: "원본 URL" },
              clicks: { type: "integer", description: "클릭 수" },
              createdAt: { type: "string", format: "date-time", description: "생성 시각" },
            },
            required: ["shortCode", "targetUrl", "clicks", "createdAt"],
          },
          404: {
            description: "단축 URL을 찾을 수 없음",
            type: "object",
            properties: { message: { type: "string" } },
            required: ["message"],
            additionalProperties: false,
            examples: [{ message: "해당 단축 URL은 존재하지 않습니다." }],
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { shortCode: string } }>, reply: FastifyReply) => {
      const { shortCode } = request.params;
      const result = await getUrlInfo(fastify.db, shortCode);
      if (!result.ok) {
        reply.code(404).send({ message: "해당 단축 URL은 존재하지 않습니다." });
        return;
      }
      reply.send(result.data);
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
      const targetUrl = await getTargetUrl(fastify.db, shortCode);
      if (targetUrl) {
        await recordClick(fastify.db, shortCode);
        reply.redirect(targetUrl);
        return;
      }
      reply.code(404).send({ message: "해당 단축 URL은 존재하지 않습니다." });
    }
  );
};
