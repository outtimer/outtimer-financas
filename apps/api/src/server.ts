import Fastify from "fastify";
import { healthRoutes } from "./modules/health/health.routes.js";

const app = Fastify({ logger: true });

app.register(healthRoutes);

const start = async () => {
  try {
    await app.listen({ port: 3333, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
