import fp from "fastify-plugin";
import fastifyEnv from "@fastify/env";

declare module "fastify" {
  export interface FastifyInstance {
    config: {
      PORT: number;
      NODE_ENV: "development" | "production";
      BASE_URL: string;
      DATABASE_URL: string;
    };
  }
}

const schema = {
  type: "object",
  properties: {
    NODE_ENV: { type: "string", enum: ["development", "production"], default: "development" },
    PORT: { type: "number", default: 3000 },
    BASE_URL: { type: "string" },
    DATABASE_URL: { type: "string" },
  },
  required: ["DATABASE_URL"],
};

export default fp(async fastify => {
  await fastify.register(fastifyEnv, {
    confKey: "config",
    schema,
    dotenv: true,
  });
});
