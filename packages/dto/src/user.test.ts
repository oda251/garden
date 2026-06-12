import { describe, it, expect } from "vitest";
import { UpdateUserRoleDto, UserResponseDto } from "./user.js";

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

  it("userId が空文字だと拒否する", () => {
    const result = UpdateUserRoleDto.safeParse({
      userId: "",
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

describe("UserResponseDto", () => {
  it("有効なレスポンスデータをパースできる", () => {
    const result = UserResponseDto.safeParse({
      id: "user-1",
      name: "テストユーザー",
      email: "test@example.com",
      role: "user",
    });
    expect(result.success).toBe(true);
  });

  it("必須フィールドが欠けていると拒否する", () => {
    const result = UserResponseDto.safeParse({
      id: "user-1",
    });
    expect(result.success).toBe(false);
  });

  it("pick で選択されていないフィールドは除外される", () => {
    const result = UserResponseDto.safeParse({
      id: "user-1",
      name: "テストユーザー",
      email: "test@example.com",
      role: "user",
      image: "https://example.com/avatar.png",
      emailVerified: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("image");
      expect(result.data).not.toHaveProperty("emailVerified");
    }
  });
});
