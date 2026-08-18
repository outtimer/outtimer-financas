import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(import.meta.dirname, "../../../.env") });

import Fastify from "fastify";
import jwt from "@fastify/jwt";
import { healthRoutes } from "./modules/health/health.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";

const app = Fastify({ logger: true });

app.register(jwt, {
  secret: process.env["JWT_SECRET"] ?? "",
  sign: { expiresIn: process.env["JWT_EXPIRES_IN"] ?? "7d" },
});

app.register(healthRoutes);
app.register(authRoutes);

const start = async () => {
  try {
    const port = Number(process.env["API_PORT"] ?? 3333);
    const host = process.env["API_HOST"] ?? "0.0.0.0";

    await app.listen({ port, host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
