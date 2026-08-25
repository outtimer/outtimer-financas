import type { FastifyInstance } from "fastify";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { createAccountSchama, updateAccountSchema } from "./accounts.schema.js";
import {
  getAccounts,
  getInativeAccounts,
  createAccount,
  updateAccount,
  deactivateAccount,
  reactivateAccount,
} from "./accounts.service.js";

export async function accountRoutes(app: FastifyInstance) {
  app.addHook("onRequest", verifyJWT);

  app.get("/accounts", async (request) => {
    return getAccounts(request.user.sub);
  });

  app.get("/accounts/inactive", async (request) => {
    return getInativeAccounts(request.user.sub);
  });

  app.post("/accounts", async (request, reply) => {
    const parsed = createAccountSchama.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const account = await createAccount(request.user.sub, parsed.data);
    return reply.status(201).send(account);
  });

  app.patch("/accounts/:id", async (request, reply) => {
    const parsed = updateAccountSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const { id } = request.params as { id: string };
    const account = await updateAccount(request.user.sub, id, parsed.data);
    return reply.send(account);
  });

  app.delete("/accounts/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await deactivateAccount(request.user.sub, id);
    return reply.status(204).send();
  });

  app.patch("/accounts/:id/reactivate", async (request, reply) => {
    const { id } = request.params as { id: string };
    const account = await reactivateAccount(request.user.sub, id);
    return reply.send(account);
  });
}
