import { describe, it, expect, beforeEach } from "vitest";
import {
  createTestDb,
  createTestApp,
  TEST_USER,
  seedTestTag,
  seedTestNode,
} from "./setup.js";
import * as schema from "@garden/schema";

describe("Tag API", () => {
  let testDb: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    testDb = createTestDb();
  });

  describe("GET /api/tag/list", () => {
    it("空のリストを返す", async () => {
      const app = createTestApp(testDb);
      const response = await app.request("/api/tag/list");
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual([]);
    });

    it("全タグを返す", async () => {
      await seedTestTag(testDb, { id: "t1", name: "tag-1" });
      await seedTestTag(testDb, { id: "t2", name: "tag-2" });
      const app = createTestApp(testDb);

      const response = await app.request("/api/tag/list");
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveLength(2);
    });
  });

  describe("POST /api/tag", () => {
    it("認証ユーザーがタグを作成できる", async () => {
      const app = createTestApp(testDb, TEST_USER);

      const response = await app.request("/api/tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "new-tag" }),
      });

      expect(response.status).toBe(201);
      const body = (await response.json()) as Record<string, unknown>;
      expect(body.name).toBe("new-tag");
    });

    it("未認証だと 401", async () => {
      const app = createTestApp(testDb, null);

      const response = await app.request("/api/tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "fail" }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/tag/:id", () => {
    it("認証ユーザーがタグを削除できる", async () => {
      await seedTestTag(testDb, { id: "t1", name: "doomed" });
      const app = createTestApp(testDb, TEST_USER);

      const response = await app.request("/api/tag/t1", {
        method: "DELETE",
      });

      expect(response.status).toBe(200);
    });

    it("存在しないタグは 404", async () => {
      const app = createTestApp(testDb, TEST_USER);

      const response = await app.request("/api/tag/nonexistent", {
        method: "DELETE",
      });

      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/tag/node", () => {
    it("ノードにタグを関連付けられる", async () => {
      await seedTestNode(testDb, { id: "n1" });
      await seedTestTag(testDb, { id: "t1" });
      const app = createTestApp(testDb, TEST_USER);

      const response = await app.request("/api/tag/node", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId: "n1", tagId: "t1" }),
      });

      expect(response.status).toBe(201);

      const nodeTagRows = await testDb.select().from(schema.nodeTags);
      expect(nodeTagRows).toHaveLength(1);
    });
  });

  describe("DELETE /api/tag/node", () => {
    it("ノードからタグの関連を解除できる", async () => {
      await seedTestNode(testDb, { id: "n1" });
      await seedTestTag(testDb, { id: "t1" });
      await testDb
        .insert(schema.nodeTags)
        .values({ nodeId: "n1", tagId: "t1" });
      const app = createTestApp(testDb, TEST_USER);

      const response = await app.request("/api/tag/node", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId: "n1", tagId: "t1" }),
      });

      expect(response.status).toBe(200);

      const nodeTagRows = await testDb.select().from(schema.nodeTags);
      expect(nodeTagRows).toHaveLength(0);
    });
  });
});
