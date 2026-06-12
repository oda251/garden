import { describe, it, expect } from "vitest";
import { createMockNode, createMockUser, createMockTag } from "./index.js";
import {
  NodeInsertBaseSchema,
  UserInsertSchema,
  TagInsertSchema,
} from "@garden/schema";

describe("createMockNode", () => {
  it("title プロパティを持つオブジェクトを返す", () => {
    const node = createMockNode();
    expect(node).toHaveProperty("title");
    expect(typeof node.title).toBe("string");
  });

  it("createdAt プロパティを持つ", () => {
    const node = createMockNode();
    expect(node).toHaveProperty("createdAt");
  });

  it("updatedAt プロパティを持つ", () => {
    const node = createMockNode();
    expect(node).toHaveProperty("updatedAt");
  });

  it("NodeInsertBaseSchema のバリデーションを通過する", () => {
    const node = createMockNode();
    const result = NodeInsertBaseSchema.safeParse(node);
    expect(result.success).toBe(true);
  });
});

describe("createMockUser", () => {
  it("name プロパティを持つオブジェクトを返す", () => {
    const user = createMockUser();
    expect(user).toHaveProperty("name");
    expect(typeof user.name).toBe("string");
  });

  it("email プロパティを持つ", () => {
    const user = createMockUser();
    expect(user).toHaveProperty("email");
    expect(typeof user.email).toBe("string");
  });

  it("UserInsertSchema のバリデーションを通過する", () => {
    const user = createMockUser();
    const result = UserInsertSchema.safeParse(user);
    expect(result.success).toBe(true);
  });
});

describe("createMockTag", () => {
  it("name プロパティを持つオブジェクトを返す", () => {
    const tag = createMockTag();
    expect(tag).toHaveProperty("name");
    expect(typeof tag.name).toBe("string");
  });

  it("TagInsertSchema のバリデーションを通過する", () => {
    const tag = createMockTag();
    const result = TagInsertSchema.safeParse(tag);
    expect(result.success).toBe(true);
  });
});
