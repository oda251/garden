import { createMiddleware } from "hono/factory";
import type { AppEnv, AppVariables } from "../env.js";
import type { AuthUser } from "./types.js";

type RequireAuthEnv = {
  Bindings: AppEnv;
  Variables: AppVariables & { user: AuthUser };
};

export const requireAuth = createMiddleware<RequireAuthEnv>(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ code: "UNAUTHORIZED", message: "Unauthorized" }, 401);
  }
  await next();
});
