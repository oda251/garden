import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { Hono } from "hono";
import * as schema from "@garden/schema";
import { nodeRouter } from "../router/node.js";
import { tagRouter } from "../router/tag.js";
import { adminRouter } from "../router/admin.js";
import type { AppEnv, AppVariables } from "../env.js";
import type { AuthUser } from "../auth/types.js";

type TestDb = ReturnType<typeof drizzle<typeof schema>>;

const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    parent_id TEXT REFERENCES nodes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    created_by TEXT REFERENCES "user"(id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS node_tags (
    node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (node_id, tag_id)
  );
`;

export const createTestDb = (): TestDb => {
  const sqlite = new Database(":memory:");
  // D1 と同様に FK 制約を無効化 (テスト用シード投入を容易にするため)
  sqlite.pragma("foreign_keys = OFF");
  sqlite.exec(CREATE_TABLES_SQL);
  return drizzle(sqlite, { schema });
};

export const createTestApp = (
  testDb: TestDb,
  authenticatedUser: AuthUser | null = null,
) => {
  const app = new Hono<{ Bindings: AppEnv; Variables: AppVariables }>();

  // db と user を注入するミドルウェア
  app.use("*", async (c, next) => {
    // TestDb は Database と完全一致しないが、select/insert/update/delete は互換
    c.set("db", testDb as unknown as AppVariables["db"]);
    c.set("user", authenticatedUser);
    await next();
  });

  app.route("/api/node", nodeRouter);
  app.route("/api/tag", tagRouter);
  app.route("/api/admin", adminRouter);

  return app;
};

export const TEST_USER: AuthUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  role: "user",
};

export const TEST_ADMIN: AuthUser = {
  id: "admin-1",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
};

export const seedTestNode = async (
  testDb: TestDb,
  overrides: Partial<{
    id: string;
    title: string;
    content: string;
    parentId: string | null;
    createdBy: string | null;
  }> = {},
) => {
  const node = {
    id: overrides.id ?? "node-1",
    title: overrides.title ?? "Test Node",
    content: overrides.content ?? "Test content",
    parentId: overrides.parentId ?? null,
    createdBy: overrides.createdBy ?? TEST_USER.id,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
  await testDb.insert(schema.nodes).values(node);
  return node;
};

export const seedTestTag = async (
  testDb: TestDb,
  overrides: Partial<{ id: string; name: string }> = {},
) => {
  const tag = {
    id: overrides.id ?? "tag-1",
    name: overrides.name ?? "test-tag",
  };
  await testDb.insert(schema.tags).values(tag);
  return tag;
};

export const seedTestUser = async (
  testDb: TestDb,
  overrides: Partial<{
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
  }> = {},
) => {
  const now = new Date();
  await testDb.insert(schema.users).values({
    id: overrides.id ?? "user-1",
    name: overrides.name ?? "Test User",
    email: overrides.email ?? "test@example.com",
    emailVerified: false,
    role: overrides.role ?? "user",
    createdAt: now,
    updatedAt: now,
  });
};
