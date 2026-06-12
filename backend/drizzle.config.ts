import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "../packages/schema/src/tables/*.ts",
  out: "./drizzle",
  dialect: "sqlite",
});
