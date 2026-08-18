import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(import.meta.dirname, "../../../../.env") });

import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env["DATABASE_URL"];

if (!connectionString) {
  throw new Error(
    "DATABASE_URL não está definida, verifique o arquivo .env na raiz do projeot.",
  );
}

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });
