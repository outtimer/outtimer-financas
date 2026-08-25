import { z } from "zod";

export const createAccountSchama = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  type: z.enum(["CHECKING", "SAVINGS", "CASH"]),
  balance: z.number().default(0),
  color: z.string().optional(),
});

export const updateAccountSchema = createAccountSchama.partial();

export type CreateAccountInput = z.infer<typeof createAccountSchama>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
