import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import type { Database } from "../db/index.js";
import { users, sessions, accounts, verifications, ROLE } from "@garden/schema";

type AuthConfig = {
  db: Database;
  baseURL: string;
  secret: string;
  googleClientId: string;
  googleClientSecret: string;
  githubClientId: string;
  githubClientSecret: string;
  adminEmails: string;
  trustedOrigins: string[];
};

const parseAdminEmails = (raw: string): string[] =>
  raw
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);

const createAdminPromotionHook = (
  config: AuthConfig,
  adminEmailList: string[],
) => ({
  user: {
    create: {
      after: async (user: { id: string; email: string }) => {
        if (adminEmailList.includes(user.email)) {
          await config.db
            .update(users)
            .set({ role: ROLE.ADMIN })
            .where(eq(users.id, user.id));
        }
      },
    },
  },
});

export const createAuth = (config: AuthConfig) => {
  const adminEmailList = parseAdminEmails(config.adminEmails);

  return betterAuth({
    baseURL: config.baseURL,
    secret: config.secret,
    database: drizzleAdapter(config.db, {
      provider: "sqlite",
      schema: {
        user: users,
        session: sessions,
        account: accounts,
        verification: verifications,
      },
    }),
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: ROLE.USER,
          input: false,
        },
      },
    },
    socialProviders: {
      google: {
        clientId: config.googleClientId,
        clientSecret: config.googleClientSecret,
      },
      github: {
        clientId: config.githubClientId,
        clientSecret: config.githubClientSecret,
      },
    },
    trustedOrigins: config.trustedOrigins,
    databaseHooks: createAdminPromotionHook(config, adminEmailList),
  });
};

export type Auth = ReturnType<typeof createAuth>;
