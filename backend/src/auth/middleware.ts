import { createMiddleware } from "hono/factory";
import type { AppEnv, AppVariables } from "../env.js";
import type { AuthUser } from "./types.js";

type AuthEnv = {
  Bindings: AppEnv;
  Variables: AppVariables & { user: AuthUser | null };
};

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const auth = c.get("auth");
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (session) {
    c.set("user", session.user as AuthUser);
  } else {
    c.set("user", null);
  }

  await next();
});
