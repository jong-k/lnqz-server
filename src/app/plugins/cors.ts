import fp from "fastify-plugin";
import cors from "@fastify/cors";

export const corsPlugin = fp(async fastify => {
  await fastify.register(cors, {
    origin: "*",
    methods: ["GET", "HEAD", "POST"],
  });
});
