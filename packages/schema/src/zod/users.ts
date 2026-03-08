import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { users } from "../tables/users";

export const UserSelectSchema = createSelectSchema(users);

export const UserInsertSchema = createInsertSchema(users);
