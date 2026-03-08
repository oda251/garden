import { z } from "zod";
import { UserSelectSchema, RoleSchema } from "@garden/schema";

export const UpdateUserRoleDto = z.object({
  userId: z.string(),
  role: RoleSchema,
});

export type UpdateUserRoleDto = z.infer<typeof UpdateUserRoleDto>;

export const UserResponseDto = UserSelectSchema.pick({
  id: true,
  name: true,
  email: true,
  role: true,
});

export type UserResponseDto = z.infer<typeof UserResponseDto>;
