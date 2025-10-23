import fp from "fastify-plugin";
import Swagger from "@fastify/swagger";
import SwaggerUI from "@fastify/swagger-ui";

export const swaggerPlugin = fp(async fastify => {
  if (fastify.config.NODE_ENV !== "production") {
    await fastify.register(Swagger, {
      openapi: {
        info: {
          title: "Link Squeeze API",
          description: "API documentation for Link Squeeze URL shortener service",
          version: "1.0.0",
        },
        servers: [{ url: fastify.config.BASE_URL, description: "Local server" }],
      },
    });

    await fastify.register(SwaggerUI, {
      routePrefix: "/docs",
      staticCSP: true,
      uiConfig: {
        docExpansion: "list",
        deepLinking: false,
      },
    });
  }
});
