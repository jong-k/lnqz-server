import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { customAlphabet } from "nanoid";
import { createShortUrl, getTargetUrlByShortCode } from "./repository.js";

const BASE62_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DEFAULT_SHORTCODE_LENGTH = 7;

const generateShortCode = (length = DEFAULT_SHORTCODE_LENGTH) => {
  const nanoid = customAlphabet(BASE62_ALPHABET, length);
  return nanoid();
};

const validateTargetUrl = (targetUrl: unknown): { ok: true } | { ok: false; message: string } => {
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
};

const plugin: FastifyPluginAsync = async fastify => {
  fastify.post(
    "/api/urls",
    {
      schema: {
        summary: "단축 URL(shortUrl) 생성",
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
          201: {
            description: "단축 URL 생성 성공",
            type: "object",
            properties: {
              shortUrl: { type: "string", description: "단축 URL" },
              targetUrl: { type: "string", description: "원본 URL" },
            },
            required: ["shortUrl", "targetUrl"],
          },
          400: {
            description: "잘못된 요청",
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
      // 유니크 충돌 시 짧게 재시도
      const MAX_RETRIES = 3;
      let attempt = 0;
      while (attempt < MAX_RETRIES) {
        const shortCode = generateShortCode();
        const created = await createShortUrl(fastify.db, shortCode, targetUrl);
        if (created) {
          return { shortUrl: `${fastify.config.BASE_URL}/${shortCode}`, targetUrl };
        }
        attempt++;
      }
      // 재시도 초과 시 에러 처리
      reply.code(500).send({ message: "단축 코드 생성에 실패했습니다. 다시 시도해주세요." });
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
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { shortCode: string } }>, reply: FastifyReply) => {
      const { shortCode } = request.params;
      const target = await getTargetUrlByShortCode(fastify.db, shortCode);
      if (target) {
        reply.redirect(target);
        return;
      }
      reply.code(404).send({ message: "해당 단축 URL은 존재하지 않습니다." });
    }
  );
};

export default plugin;
