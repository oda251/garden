import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const ROLE = {
  ADMIN: "admin",
  USER: "user",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: text("email_verified", { mode: "text" }).notNull().default("false"),
  image: text("image"),
  role: text("role").notNull().default(ROLE.USER).$type<Role>(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
