import { z } from "zod";
import { UserSelectSchema } from "@garden/schema";
import type { Role } from "@garden/schema";

export const UpdateUserRoleDto = z.object({
  userId: z.string(),
  role: z.custom<Role>(),
});

export type UpdateUserRoleDto = z.infer<typeof UpdateUserRoleDto>;

export const UserResponseDto = UserSelectSchema.pick({
  id: true,
  name: true,
  email: true,
  role: true,
});

export type UserResponseDto = z.infer<typeof UserResponseDto>;
