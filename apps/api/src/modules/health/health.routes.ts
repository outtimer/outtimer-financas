import type { FastifyInstance } from "fastify";
import { getHealthStatus } from "./health.service.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return getHealthStatus();
  });

  app.get("/health/private", { preHandler: [verifyJWT] }, async (request) => {
    return {
      status: "ok",
      userId: request.user.sub,
    };
  });
}
