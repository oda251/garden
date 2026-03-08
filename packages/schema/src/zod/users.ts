import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, ROLE } from "../tables/users.js";

const roleValues: [string, ...string[]] = [ROLE.ADMIN, ROLE.USER];

export const isValidRole = (value: string) => roleValues.includes(value);

export const RoleSchema = z.enum(roleValues);

export const UserSelectSchema = createSelectSchema(users);

export const UserInsertSchema = createInsertSchema(users);
