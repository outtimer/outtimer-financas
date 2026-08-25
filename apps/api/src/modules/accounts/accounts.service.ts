import { prisma } from "../../lib/prisma.js";
import type {
  CreateAccountInput,
  UpdateAccountInput,
} from "./accounts.schema.js";

export async function getAccounts(userId: string) {
  return prisma.account.findMany({
    where: { userId, isActived: true },
    orderBy: { name: "asc" },
  });
}

export async function getInativeAccounts(userId: string) {
  return prisma.account.findMany({
    where: { userId, isActived: false },
    orderBy: { name: "asc" },
  });
}

export async function createAccount(userId: string, data: CreateAccountInput) {
  return prisma.account.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      balance: data.balance,
      color: data.color ?? null,
    },
  });
}

export async function updateAccount(
  userId: string,
  accountId: string,
  data: UpdateAccountInput,
) {
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined),
  );
  return prisma.account.update({
    where: { id: accountId, userId },
    data: cleanData,
  });
}

export async function deactivateAccount(userId: string, accountId: string) {
  return prisma.account.update({
    where: { id: accountId, userId },
    data: { isActived: false },
  });
}

export async function reactivateAccount(userId: string, accountId: string) {
  return prisma.account.update({
    where: { id: accountId, userId },
    data: { isActived: true },
  });
}
