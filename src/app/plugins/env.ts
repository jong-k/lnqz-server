import fp from "fastify-plugin";
import fastifyEnv from "@fastify/env";

declare module "fastify" {
  export interface FastifyInstance {
    config: {
      NODE_ENV: "development" | "production";
      PORT: string;
      BASE_URL: string;
      SERVICE_URL: string;
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
    SERVICE_URL: { type: "string" },
    DATABASE_URL: { type: "string" },
  },
  required: ["PORT", "BASE_URL", "SERVICE_URL", "DATABASE_URL"],
};

export const envPlugin = fp(async fastify => {
  await fastify.register(fastifyEnv, {
    confKey: "config",
    schema,
    dotenv: true,
  });
});
