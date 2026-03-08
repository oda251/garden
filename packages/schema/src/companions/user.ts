import type { InferSelectModel } from "drizzle-orm";
import { ROLE } from "../tables/users";
import type { users } from "../tables/users";

type UserRow = InferSelectModel<typeof users>;

export const User = {
  isAdmin: (user: UserRow): boolean => user.role === ROLE.ADMIN,
} as const;
