import { createMiddleware } from "hono/factory";
import { ROLE } from "@garden/schema";
import { AppError } from "../domain/app-error.js";
import type { AppEnv, AppVariables } from "../env.js";
import type { AuthUser } from "./types.js";

type RequireAdminEnv = {
  Bindings: AppEnv;
  Variables: AppVariables & { user: AuthUser };
};

export const requireAdmin = createMiddleware<RequireAdminEnv>(
  async (c, next) => {
    const user = c.get("user");
    if (!user || user.role !== ROLE.ADMIN) {
      const { status, body } = AppError.toResponse(AppError.forbidden());
      return c.json(body, status);
    }
    await next();
  },
);
