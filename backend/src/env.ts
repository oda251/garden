import type { Database } from "./db/index.js";
import type { Auth, AuthUser } from "./auth/index.js";

export type AppEnv = {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  ADMIN_EMAILS: string;
  FRONTEND_URL: string;
};

export type AppVariables = {
  db: Database;
  auth: Auth;
  user: AuthUser | null;
};
