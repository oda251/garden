import type { ErrorHandler } from "hono";
import type { AppEnv, AppVariables } from "../env.js";

export const errorHandler: ErrorHandler<{
  Bindings: AppEnv;
  Variables: AppVariables;
}> = (error, c) => {
  console.error("[unhandled error]", error);
  return c.json({ code: "INTERNAL", message: "Internal server error" }, 500);
};
