import { createMiddleware } from "hono/factory";
import { AppError } from "../domain/app-error.js";
import type { AppEnv, AppVariables } from "../env.js";
import type { AuthUser } from "./types.js";

type RequireAuthEnv = {
  Bindings: AppEnv;
  Variables: AppVariables & { user: AuthUser };
};

export const requireAuth = createMiddleware<RequireAuthEnv>(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    const { status, body } = AppError.toResponse(AppError.unauthorized());
    return c.json(body, status);
  }
  await next();
});
