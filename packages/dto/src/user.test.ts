import { describe, it, expect } from "vitest";
import { UpdateUserRoleDto } from "./user.js";

describe("UpdateUserRoleDto", () => {
  it("userId + role (admin) を受け付ける", () => {
    const result = UpdateUserRoleDto.safeParse({
      userId: "user-123",
      role: "admin",
    });
    expect(result.success).toBe(true);
  });

  it("userId + role (user) を受け付ける", () => {
    const result = UpdateUserRoleDto.safeParse({
      userId: "user-123",
      role: "user",
    });
    expect(result.success).toBe(true);
  });

  it("無効な role を拒否する", () => {
    const result = UpdateUserRoleDto.safeParse({
      userId: "user-123",
      role: "moderator",
    });
    expect(result.success).toBe(false);
  });

  it("userId がないと拒否する", () => {
    const result = UpdateUserRoleDto.safeParse({
      role: "admin",
    });
    expect(result.success).toBe(false);
  });

  it("role がないと拒否する", () => {
    const result = UpdateUserRoleDto.safeParse({
      userId: "user-123",
    });
    expect(result.success).toBe(false);
  });
});
