import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, ROLE } from "../tables/users.js";
import type { Role } from "../tables/users.js";

const ROLE_VALUES = [ROLE.ADMIN, ROLE.USER] as const satisfies readonly Role[];

export const isValidRole = (value: string): value is Role =>
  (ROLE_VALUES as readonly string[]).includes(value);

export const RoleSchema = z.enum(ROLE_VALUES);

export const UserSelectSchema = createSelectSchema(users);

export const UserInsertSchema = createInsertSchema(users);
