import type { FastifyInstance } from "fastify";
import { registerSchema, loginSchema } from "./auth.schema.js";
import {
  registerUser,
  loginUser,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
} from "./auth.service.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    try {
      const user = await registerUser(parsed.data);
      const token = app.jwt.sign({ sub: user.id });

      return reply.status(201).send({
        token,
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (err) {
      if (err instanceof EmailAlreadyExistsError) {
        return reply.status(409).send({ error: err.message });
      }
      throw err;
    }
  });

  app.post("/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    try {
      const user = await loginUser(parsed.data);
      const token = app.jwt.sign({ sub: user.id });

      return reply.send({
        token,
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        return reply.status(401).send({ error: err.message });
      }
      throw err;
    }
  });
}
