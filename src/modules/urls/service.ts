import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { customAlphabet } from "nanoid";
import { createShortUrl, getTargetUrlByShortCode } from "./repository.js";

const BASE62_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DEFAULT_SHORTCODE_LENGTH = 7;

const generateShortCode = (length = DEFAULT_SHORTCODE_LENGTH) => {
  const nanoid = customAlphabet(BASE62_ALPHABET, length);
  return nanoid();
};

export const validateTargetUrl = (targetUrl: unknown): { ok: true } | { ok: false; message: string } => {
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

type CreateResult = { ok: true; shortUrl: string; targetUrl: string } | { ok: false; message: string; status?: number };

export async function getShortUrl(db: NodePgDatabase, baseUrl: string, targetUrl: string): Promise<CreateResult> {
  const validation = validateTargetUrl(targetUrl);
  if (!validation.ok) {
    return { ok: false, message: validation.message, status: 400 };
  }

  const MAX_RETRIES = 3;
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    const shortCode = generateShortCode();
    const created = await createShortUrl(db, shortCode, targetUrl);
    if (created) {
      return { ok: true, shortUrl: `${baseUrl}/${shortCode}`, targetUrl };
    }
    attempt++;
  }
  return { ok: false, message: "단축 코드 생성에 실패했습니다. 다시 시도해주세요.", status: 500 };
}

export async function getTargetUrl(db: NodePgDatabase, shortCode: string) {
  return getTargetUrlByShortCode(db, shortCode);
}
