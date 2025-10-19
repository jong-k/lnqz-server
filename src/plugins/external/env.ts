import fp from "fastify-plugin";
import fastifyEnv from "@fastify/env";

declare module "fastify" {
  export interface FastifyInstance {
    config: {
      PORT: number;
      NODE_ENV: "development" | "production";
      DATABASE_URL: string;
    };
  }
}

const schema = {
  type: "object",
  properties: {
    NODE_ENV: { type: "string", enum: ["development", "test", "production"], default: "development" },
    PORT: { type: "number", default: 3000 },
    DATABASE_URL: { type: "string" },
  },
};

export default fp(async fastify => {
  await fastify.register(fastifyEnv, {
    confKey: "config",
    schema,
    dotenv: true,
  });
});
