import type { Role } from "@garden/schema";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};
