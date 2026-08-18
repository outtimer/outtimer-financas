import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import type { RegisterInput, LoginInput } from "./auth.schema.js";

export class EmailAlreadyExistsError extends Error {}
export class InvalidCredentialsError extends Error {}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new EmailAlreadyExistsError("E-mail já cadastrado");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: passwordHash,
    },
  });

  return user;
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new InvalidCredentialsError("Email ou Senha inválidos");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);
  if (!passwordMatches) {
    throw new InvalidCredentialsError("Email ou Senha inválidos");
  }

  return user;
}
