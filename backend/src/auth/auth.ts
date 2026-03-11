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

export const createAuth = (config: AuthConfig) => {
  const adminEmailList = config.adminEmails
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);

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
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            const shouldBeAdmin = adminEmailList.includes(user.email);

            if (shouldBeAdmin) {
              await config.db
                .update(users)
                .set({ role: ROLE.ADMIN })
                .where(eq(users.id, user.id));
            }
          },
        },
      },
    },
  });
};

export type Auth = ReturnType<typeof createAuth>;
