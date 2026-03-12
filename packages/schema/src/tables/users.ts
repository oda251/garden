import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const ROLE = {
  ADMIN: "admin",
  USER: "user",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

export const users = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  role: text("role").notNull().default(ROLE.USER).$type<Role>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
