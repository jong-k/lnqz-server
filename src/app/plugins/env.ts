import fp from "fastify-plugin";
import { access } from "node:fs/promises";
import { join } from "node:path";
import fastifyEnv from "@fastify/env";

declare module "fastify" {
  export interface FastifyInstance {
    config: {
      NODE_ENV: "development" | "production";
      PORT: string;
      BASE_URL: string;
      DATABASE_URL: string;
    };
  }
}

const schema = {
  type: "object",
  properties: {
    NODE_ENV: { type: "string", enum: ["development", "production"], default: "development" },
    PORT: { type: "string" },
    BASE_URL: { type: "string" },
    DATABASE_URL: { type: "string" },
  },
  required: ["PORT", "BASE_URL", "DATABASE_URL"],
};

export const envPlugin = fp(async fastify => {
  if (process.env.NODE_ENV !== "production") {
    try {
      await access(join(process.cwd(), ".env"));
      await fastify.register(fastifyEnv, {
        confKey: "config",
        schema,
        dotenv: true,
      });
    } catch {
      throw new Error(".env 파일이 필요합니다");
    }
  }
});
