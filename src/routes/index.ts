import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { randomBytes } from "node:crypto";

const BASE62_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DEFAULT_CODE_LENGTH = 7;
const TEMP_URL_MAP = new Map<string, string>();

function generateShortCode(length = DEFAULT_CODE_LENGTH) {
  const alphabetLen = BASE62_ALPHABET.length;
  while (true) {
    const bytes = randomBytes(length);
    let out = "";
    for (const b of bytes) {
      out += BASE62_ALPHABET.charAt(b % alphabetLen);
    }
    if (!TEMP_URL_MAP.has(out)) return out;
  }
}

function validateTargetUrl(targetUrl: unknown): { ok: true } | { ok: false; message: string } {
  if (!targetUrl || typeof targetUrl !== "string") {
    return { ok: false, message: "targetUrl이 누락되었습니다." };
  }
  if (!targetUrl.startsWith("https://")) {
    return { ok: false, message: "https로 시작하는 URL만 허용됩니다." };
  }
  try {
    const url = new URL(targetUrl);
    if (url.protocol !== "https:" || !url.hostname) {
      return { ok: false, message: "올바른 https URL이 아닙니다." };
    }
  } catch {
    return { ok: false, message: "올바른 https URL이 아닙니다." };
  }
  return { ok: true };
}

export default async function routes(fastify: FastifyInstance) {
  fastify.post(
    "/api/urls",
    {
      schema: {
        summary: "단축 URL(shortCode) 생성",
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
              shortCode: { type: "string", description: "단축 URL" },
              targetUrl: { type: "string", description: "원본 URL" },
            },
            required: ["shortCode", "targetUrl"],
          },
          400: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
            required: ["message"],
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: { targetUrl: string } }>, reply: FastifyReply) => {
      const { targetUrl } = request.body;
      const validation = validateTargetUrl(targetUrl);

      if (!validation.ok) {
        reply.code(400).send({ message: validation.message });
        return;
      }
      const shortCode = generateShortCode();
      TEMP_URL_MAP.set(shortCode, targetUrl);
      const fullShortCode = `http://localhost:3000/${shortCode}`;
      return { shortCode: fullShortCode, targetUrl };
    }
  );

  fastify.get(
    "/:shortCode",
    {
      schema: {
        summary: "단축 URL로 리다이렉트",
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
            },
          },
          required: ["shortCode"],
          additionalProperties: false,
        },
        response: {
          302: {},
          404: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
            required: ["message"],
            additionalProperties: false,
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { shortCode: string } }>, reply: FastifyReply) => {
      const { shortCode } = request.params;
      const targetUrl = TEMP_URL_MAP.get(shortCode);
      if (targetUrl) {
        reply.redirect(targetUrl);
        return;
      }
      reply.code(404).send({ message: "해당 단축 URL은 존재하지 않습니다." });
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
