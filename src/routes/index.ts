import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomBytes } from "node:crypto";

const BASE62_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DEFAULT_CODE_LENGTH = 7;

function generateShortCode(length = DEFAULT_CODE_LENGTH) {
  const bytes = randomBytes(length);
  const alphabetLen = BASE62_ALPHABET.length;
  let out = "";
  for (const b of bytes) {
    out += BASE62_ALPHABET.charAt(b % alphabetLen);
  }
  // TODO: out 중복 방지 로직 추가
  return out;
}

export default async function routes(fastify: FastifyInstance) {
  fastify.post(
    "/api/urls",
    {
      schema: {
        summary: "단축된 URL(shortCode) 생성",
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
              shortCode: { type: "string", description: "단축된 URL" },
              targetUrl: { type: "string", description: "원본 URL" },
            },
            required: ["shortCode", "targetUrl"],
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: { targetUrl: string } }>) => {
      const { targetUrl } = request.body;
      const shortCode = generateShortCode();
      return { shortCode, targetUrl };
    }
  );

  fastify.get(
    "/health",
    {
      schema: { summary: "서버 상태 확인", tags: ["health check"], response: { 200: {} } },
    },
    async (_request, reply) => {
      reply.code(200).send();
    }
  );
}
