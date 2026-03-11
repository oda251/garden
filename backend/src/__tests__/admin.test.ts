import { describe, it, expect, beforeEach } from "vitest";
import {
  createTestDb,
  createTestApp,
  TEST_USER,
  TEST_ADMIN,
  seedTestUser,
} from "./setup.js";

describe("Admin API", () => {
  let testDb: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    testDb = createTestDb();
  });

  describe("GET /api/admin/users", () => {
    it("admin がユーザー一覧を取得できる", async () => {
      await seedTestUser(testDb, {
        id: "u1",
        name: "User 1",
        email: "u1@test.com",
      });
      await seedTestUser(testDb, {
        id: "u2",
        name: "User 2",
        email: "u2@test.com",
      });
      const app = createTestApp(testDb, TEST_ADMIN);

      const response = await app.request("/api/admin/users");
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveLength(2);
      expect(body[0]).toHaveProperty("id");
      expect(body[0]).toHaveProperty("name");
      expect(body[0]).toHaveProperty("email");
      expect(body[0]).toHaveProperty("role");
    });

    it("一般ユーザーは 403", async () => {
      const app = createTestApp(testDb, TEST_USER);

      const response = await app.request("/api/admin/users");
      expect(response.status).toBe(403);
    });

    it("未認証は 401", async () => {
      const app = createTestApp(testDb, null);

      const response = await app.request("/api/admin/users");
      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/admin/users/:id/role", () => {
    it("admin がユーザーロールを変更できる", async () => {
      await seedTestUser(testDb, {
        id: "target-user",
        email: "target@test.com",
      });
      const app = createTestApp(testDb, TEST_ADMIN);

      const response = await app.request("/api/admin/users/target-user/role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "target-user", role: "admin" }),
      });

      expect(response.status).toBe(200);
    });

    it("存在しないユーザーは 404", async () => {
      const app = createTestApp(testDb, TEST_ADMIN);

      const response = await app.request("/api/admin/users/nonexistent/role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "nonexistent", role: "admin" }),
      });

      expect(response.status).toBe(404);
    });

    it("無効な role は 400", async () => {
      const app = createTestApp(testDb, TEST_ADMIN);

      const response = await app.request("/api/admin/users/u1/role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "u1", role: "invalid" }),
      });

      expect(response.status).toBe(400);
    });

    it("一般ユーザーは 403", async () => {
      const app = createTestApp(testDb, TEST_USER);

      const response = await app.request("/api/admin/users/u1/role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "u1", role: "admin" }),
      });

      expect(response.status).toBe(403);
    });
  });
});
