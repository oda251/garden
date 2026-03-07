import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { users } from "../tables/users.js";

export const UserSelectSchema = createSelectSchema(users);

export const UserInsertSchema = createInsertSchema(users);
