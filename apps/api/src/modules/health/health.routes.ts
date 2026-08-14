import type { FastifyInstance } from "fastify";
import { getHealthStatus } from "./health.service.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return getHealthStatus();
  });
}
