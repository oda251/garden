import { describe, it, expect } from "vitest";
import { RoleSchema, isValidRole } from "./users.js";

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
