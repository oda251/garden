import { Hono } from "hono";
import type { AppEnv, AppVariables } from "../env.js";
import { nodeRouter } from "./node.js";
import { tagRouter } from "./tag.js";
import { adminRouter } from "./admin.js";

export const apiRouter = new Hono<{
  Bindings: AppEnv;
  Variables: AppVariables;
}>()
  .route("/node", nodeRouter)
  .route("/tag", tagRouter)
  .route("/admin", adminRouter);

export type AppRouter = typeof apiRouter;
