import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(import.meta.dirname, "../../../../.env") });

if (process.env["DATABASE_URL_TEST"]) {
  process.env["DATABASE_URL"] = process.env["DATABASE_URL_TEST"];
}
