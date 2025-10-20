import { eq } from "drizzle-orm";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { customAlphabet } from "nanoid";
import { urls } from "../db/schema.js";

const BASE62_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DEFAULT_SHORTCODE_LENGTH = 7;

function generateShortCode(length = DEFAULT_SHORTCODE_LENGTH) {
  const nanoid = customAlphabet(BASE62_ALPHABET, length);
  return nanoid();
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
  fastify.get(
    "/",
    {
      schema: {
        summary: "루트 엔드포인트",
        response: {
          302: { description: "/docs 페이지로 리다이렉트", type: "null" },
        },
      },
    },
    async (_request, reply) => {
      reply.redirect("/docs");
    }
  );

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
        const inserted = await fastify.db
          .insert(urls)
          .values({ shortCode, targetUrl })
          .onConflictDoNothing({ target: urls.shortCode })
          .returning();
        if (inserted.length > 0) {
          return { shortUrl: `${fastify.config.BASE_URL}/${shortCode}`, targetUrl };
        }
        attempt++;
      }
      // 재시도 초과 시 에러 처리
      reply.code(500).send({ message: "단축 코드 생성에 실패했습니다. 다시 시도해주세요." });
    }
  );

  fastify.get(
    "/:shortCode",
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
      const row = await fastify.db
        .select({ targetUrl: urls.targetUrl })
        .from(urls)
        .where(eq(urls.shortCode, shortCode))
        .limit(1);

      if (row.length > 0) {
        reply.redirect(row[0].targetUrl);
        return;
      }
      reply.code(404).send({ message: "해당 단축 URL은 존재하지 않습니다." });
    }
  );

  fastify.get(
    "/health",
    {
      schema: {
        summary: "서버 상태 확인",
        tags: ["health check"],
        response: {
          200: {
            description: "서버가 정상적으로 작동 중임을 나타냄",
            type: "null",
          },
        },
      },
    },
    async (_request, reply) => {
      reply.code(200).send();
    }
  );
}
