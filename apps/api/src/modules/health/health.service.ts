import type { HealthResponse } from "./health.schema.js";

export function getHealthStatus(): HealthResponse {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
}
