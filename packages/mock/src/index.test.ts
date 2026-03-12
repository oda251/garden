import { describe, it, expect } from "vitest";
import { createMockNode, createMockUser, createMockTag } from "./index.js";

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
});

describe("createMockTag", () => {
  it("name プロパティを持つオブジェクトを返す", () => {
    const tag = createMockTag();
    expect(tag).toHaveProperty("name");
    expect(typeof tag.name).toBe("string");
  });
});
