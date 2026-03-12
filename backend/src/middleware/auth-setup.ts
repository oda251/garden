import { createMiddleware } from "hono/factory";
import type { AppEnv, AppVariables } from "../env.js";
import { createAuth } from "../auth/index.js";

type AuthSetupEnv = {
  Bindings: AppEnv;
  Variables: AppVariables;
};

export const authSetupMiddleware = createMiddleware<AuthSetupEnv>(
  async (c, next) => {
    const db = c.get("db");
    const auth = createAuth({
      db,
      baseURL: c.env.BETTER_AUTH_URL,
      secret: c.env.BETTER_AUTH_SECRET,
      googleClientId: c.env.GOOGLE_CLIENT_ID,
      googleClientSecret: c.env.GOOGLE_CLIENT_SECRET,
      githubClientId: c.env.GITHUB_CLIENT_ID,
      githubClientSecret: c.env.GITHUB_CLIENT_SECRET,
      adminEmails: c.env.ADMIN_EMAILS ?? "",
      trustedOrigins: [c.env.FRONTEND_URL],
    });
    c.set("auth", auth);
    await next();
  },
);
