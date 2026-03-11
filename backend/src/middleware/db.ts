import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../env.js";
import { createDb } from "../db/index.js";
import type { Database } from "../db/index.js";

type DbEnv = {
  Bindings: AppEnv;
  Variables: { db: Database };
};

export const dbMiddleware = createMiddleware<DbEnv>(async (c, next) => {
  const db = createDb(c.env.DB);
  c.set("db", db);
  await next();
});
