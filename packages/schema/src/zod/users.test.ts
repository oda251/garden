import { describe, it, expect } from "vitest";
import { RoleSchema, UserInsertSchema, isValidRole } from "./users.js";

describe("isValidRole", () => {
  it("admin は有効", () => {
    expect(isValidRole("admin")).toBe(true);
  });

  it("user は有効", () => {
    expect(isValidRole("user")).toBe(true);
  });

  it("unknown は無効", () => {
    expect(isValidRole("unknown")).toBe(false);
  });

  it("空文字は無効", () => {
    expect(isValidRole("")).toBe(false);
  });
});

describe("RoleSchema", () => {
  it("admin をパースできる", () => {
    const result = RoleSchema.safeParse("admin");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("admin");
    }
  });

  it("user をパースできる", () => {
    const result = RoleSchema.safeParse("user");
    expect(result.success).toBe(true);
  });

  it("無効な値を拒否する", () => {
    const result = RoleSchema.safeParse("moderator");
    expect(result.success).toBe(false);
  });
});

describe("UserInsertSchema", () => {
  const validUser = {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  it("有効なデータを受け付ける", () => {
    const result = UserInsertSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it("role を省略するとデフォルト値 user が適用される", () => {
    const result = UserInsertSchema.safeParse(validUser);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("user");
    }
  });

  it("email が欠けていると拒否する", () => {
    const { email: _, ...withoutEmail } = validUser;
    const result = UserInsertSchema.safeParse(withoutEmail);
    expect(result.success).toBe(false);
  });

  it("name が欠けていると拒否する", () => {
    const { name: _, ...withoutName } = validUser;
    const result = UserInsertSchema.safeParse(withoutName);
    expect(result.success).toBe(false);
  });

  it("無効な role を拒否する", () => {
    const result = UserInsertSchema.safeParse({
      ...validUser,
      role: "moderator",
    });
    expect(result.success).toBe(false);
  });
});
