import { describe, it, expect } from "vitest";
import { NodeInsertSchema, isNonBlankTitle } from "./nodes.js";

describe("isNonBlankTitle", () => {
  it("通常の文字列は true", () => {
    expect(isNonBlankTitle("hello")).toBe(true);
  });

  it("空文字は false", () => {
    expect(isNonBlankTitle("")).toBe(false);
  });

  it("空白のみは false", () => {
    expect(isNonBlankTitle("   ")).toBe(false);
  });

  it("前後に空白があっても中身があれば true", () => {
    expect(isNonBlankTitle("  hello  ")).toBe(true);
  });
});

describe("NodeInsertSchema", () => {
  const validNode = {
    id: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    title: "テストノード",
    content: "テスト内容",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };

  it("有効なデータを受け付ける", () => {
    const result = NodeInsertSchema.safeParse(validNode);
    expect(result.success).toBe(true);
  });

  it("title が空白のみだと拒否する", () => {
    const result = NodeInsertSchema.safeParse({
      ...validNode,
      title: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("title が空文字だと拒否する", () => {
    const result = NodeInsertSchema.safeParse({
      ...validNode,
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("parentId はオプショナル", () => {
    const result = NodeInsertSchema.safeParse({
      ...validNode,
      parentId: "parent-id",
    });
    expect(result.success).toBe(true);
  });
});
