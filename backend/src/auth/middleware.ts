import { createMiddleware } from "hono/factory";
import { z } from "zod";
import { RoleSchema } from "@garden/schema";
import type { AppEnv, AppVariables } from "../env.js";
import type { AuthUser } from "./types.js";

const AuthUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: RoleSchema,
});

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
    const parsed = AuthUserSchema.safeParse(session.user);
    c.set("user", parsed.success ? parsed.data : null);
  } else {
    c.set("user", null);
  }

  await next();
});
