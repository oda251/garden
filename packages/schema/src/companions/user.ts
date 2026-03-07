import type { InferSelectModel } from "drizzle-orm";
import { ROLE } from "../tables/users.js";
import type { users } from "../tables/users.js";

type UserRow = InferSelectModel<typeof users>;

export const User = {
  isAdmin: (user: UserRow): boolean => user.role === ROLE.ADMIN,
} as const;
