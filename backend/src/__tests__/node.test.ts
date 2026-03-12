import { describe, it, expect, beforeEach } from "vitest";
import {
  createTestDb,
  createTestApp,
  TEST_USER,
  TEST_ADMIN,
  seedTestNode,
} from "./setup.js";

describe("Node API", () => {
  let testDb: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    testDb = createTestDb();
  });

  describe("GET /api/node/list", () => {
    it("空のリストを返す", async () => {
      const app = createTestApp(testDb);
      const response = await app.request("/api/node/list");
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual([]);
    });

    it("全ノードを返す", async () => {
      await seedTestNode(testDb, { id: "n1", title: "Node 1" });
      await seedTestNode(testDb, { id: "n2", title: "Node 2" });
      const app = createTestApp(testDb);

      const response = await app.request("/api/node/list");
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveLength(2);
    });

    it("parentId でフィルタする", async () => {
      await seedTestNode(testDb, { id: "root", title: "Root" });
      await seedTestNode(testDb, {
        id: "child",
        title: "Child",
        parentId: "root",
      });
      await seedTestNode(testDb, { id: "other", title: "Other" });
      const app = createTestApp(testDb);

      const response = await app.request("/api/node/list?parentId=root");
      expect(response.status).toBe(200);
      const body = (await response.json()) as Record<string, unknown>[];
      expect(body).toHaveLength(1);
      expect(body[0]?.id).toBe("child");
    });
  });

  describe("GET /api/node/:id", () => {
    it("ノードを返す", async () => {
      await seedTestNode(testDb, { id: "n1", title: "Found" });
      const app = createTestApp(testDb);

      const response = await app.request("/api/node/n1");
      expect(response.status).toBe(200);
      const body = (await response.json()) as Record<string, unknown>;
      expect(body.title).toBe("Found");
    });

    it("存在しないノードは 404", async () => {
      const app = createTestApp(testDb);
      const response = await app.request("/api/node/nonexistent");
      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/node/:id/children", () => {
    it("子ノードを返す", async () => {
      await seedTestNode(testDb, { id: "parent" });
      await seedTestNode(testDb, {
        id: "child1",
        title: "C1",
        parentId: "parent",
      });
      await seedTestNode(testDb, {
        id: "child2",
        title: "C2",
        parentId: "parent",
      });
      const app = createTestApp(testDb);

      const response = await app.request("/api/node/parent/children");
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveLength(2);
    });
  });

  describe("POST /api/node", () => {
    it("認証ユーザーがノードを作成できる", async () => {
      const app = createTestApp(testDb, TEST_USER);

      const response = await app.request("/api/node", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Node", content: "Hello" }),
      });

      expect(response.status).toBe(201);
      const body = (await response.json()) as Record<string, unknown>;
      expect(body.title).toBe("New Node");
      expect(body.createdBy).toBe(TEST_USER.id);
    });

    it("未認証だと 401", async () => {
      const app = createTestApp(testDb, null);

      const response = await app.request("/api/node", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Fail" }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/node/:id", () => {
    it("作成者がノードを更新できる", async () => {
      await seedTestNode(testDb, {
        id: "n1",
        title: "Old",
        createdBy: TEST_USER.id,
      });
      const app = createTestApp(testDb, TEST_USER);

      const response = await app.request("/api/node/n1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Updated" }),
      });

      expect(response.status).toBe(200);
      const body = (await response.json()) as Record<string, unknown>;
      expect(body.title).toBe("Updated");
    });

    it("他人のノードは更新できない (403)", async () => {
      await seedTestNode(testDb, {
        id: "n1",
        createdBy: "other-user",
      });
      const app = createTestApp(testDb, TEST_USER);

      const response = await app.request("/api/node/n1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Hack" }),
      });

      expect(response.status).toBe(403);
    });

    it("admin は他人のノードも更新できる", async () => {
      await seedTestNode(testDb, {
        id: "n1",
        createdBy: "other-user",
      });
      const app = createTestApp(testDb, TEST_ADMIN);

      const response = await app.request("/api/node/n1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Admin Fix" }),
      });

      expect(response.status).toBe(200);
    });

    it("存在しないノードは 404", async () => {
      const app = createTestApp(testDb, TEST_USER);

      const response = await app.request("/api/node/nonexistent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Fail" }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/node/:id", () => {
    it("作成者がノードを削除できる", async () => {
      await seedTestNode(testDb, {
        id: "n1",
        createdBy: TEST_USER.id,
      });
      const app = createTestApp(testDb, TEST_USER);

      const response = await app.request("/api/node/n1", {
        method: "DELETE",
      });

      expect(response.status).toBe(200);
    });

    it("他人のノードは削除できない (403)", async () => {
      await seedTestNode(testDb, {
        id: "n1",
        createdBy: "other-user",
      });
      const app = createTestApp(testDb, TEST_USER);

      const response = await app.request("/api/node/n1", {
        method: "DELETE",
      });

      expect(response.status).toBe(403);
    });

    it("存在しないノードは 404", async () => {
      const app = createTestApp(testDb, TEST_USER);

      const response = await app.request("/api/node/nonexistent", {
        method: "DELETE",
      });

      expect(response.status).toBe(404);
    });
  });
});
