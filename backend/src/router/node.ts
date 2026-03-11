import { Hono } from "hono";
import type { AppEnv, AppVariables } from "../env.js";

export const nodeRouter = new Hono<{
  Bindings: AppEnv;
  Variables: AppVariables;
}>().get("/list", (c) => {
  return c.json([]);
});
