import { describe, it, expect } from "vitest";
import { User } from "./user.js";
import { ROLE } from "../tables/users.js";

describe("User companion", () => {
  const baseUser = {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    emailVerified: false,
    image: null,
    role: ROLE.USER,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  describe("isAdmin", () => {
    it("role が admin なら true", () => {
      expect(User.isAdmin({ ...baseUser, role: ROLE.ADMIN })).toBe(true);
    });

    it("role が user なら false", () => {
      expect(User.isAdmin({ ...baseUser, role: ROLE.USER })).toBe(false);
    });
  });
});
