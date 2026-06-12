import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { createMiddleware } from "hono/factory";
import type { AppEnv, AppVariables } from "../env.js";

export const secureHeadersMiddleware = secureHeaders();

type SecurityEnv = {
  Bindings: AppEnv;
  Variables: AppVariables;
};

export const corsMiddleware = createMiddleware<SecurityEnv>((c, next) => {
  const allowedOrigin = c.env.FRONTEND_URL ?? "http://localhost:5173";
  const corsProtection = cors({ origin: allowedOrigin });
  return corsProtection(c, next);
});

export const csrfMiddleware = createMiddleware<SecurityEnv>((c, next) => {
  const allowedOrigin = c.env.FRONTEND_URL ?? "http://localhost:5173";
  const csrfProtection = csrf({ origin: allowedOrigin });
  return csrfProtection(c, next);
});
