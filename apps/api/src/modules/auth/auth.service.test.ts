import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../../lib/prisma.js";
import {
  registerUser,
  loginUser,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
} from "./auth.service.js";

describe("auth.service", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it("Registrar um novo usuário com senha em hash", async () => {
    const user = await registerUser({
      name: "Teste",
      email: "teste@vitest.com",
      password: "senha123",
    });

    expect(user.email).toBe("teste@vitest.com");
    expect(user.password).not.toBe("senha123");
  });

  it("Bloqueia Registro com email já existente", async () => {
    await registerUser({
      name: "Um",
      email: "dup@vitest.com",
      password: "sena123",
    });

    await expect(
      registerUser({
        name: "Dois",
        email: "dup@vitest.com",
        password: "outrasenha",
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyExistsError);
  });

  it("Faz login com credenciais corretas", async () => {
    await registerUser({
      name: "Login",
      email: "login@vitest.com",
      password: "senha123",
    });

    const user = await loginUser({
      email: "login@vitest.com",
      password: "senha123",
    });
    expect(user.email).toBe("login@vitest.com");
  });

  it("Bloqueia login com senha incorreta", async () => {
    await registerUser({
      name: "Errado",
      email: "errado@vitest.com",
      password: "senha123",
    });

    await expect(
      loginUser({ email: "errado@vitest.com", password: "senhaerrada" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
