import { secureHeaders } from "hono/secure-headers";
import { csrf } from "hono/csrf";
import { createMiddleware } from "hono/factory";
import type { AppEnv, AppVariables } from "../env.js";

export const secureHeadersMiddleware = secureHeaders();

type SecurityEnv = {
  Bindings: AppEnv;
  Variables: AppVariables;
};

export const csrfMiddleware = createMiddleware<SecurityEnv>(async (c, next) => {
  const origin = c.env.FRONTEND_URL;
  const csrfProtection = csrf({ origin });
  return csrfProtection(c, next);
});
