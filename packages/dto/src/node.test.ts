import { describe, it, expect } from "vitest";
import { CreateNodeDto, UpdateNodeDto } from "./node.js";

describe("CreateNodeDto", () => {
  it("title + content + parentId を受け付ける", () => {
    const result = CreateNodeDto.safeParse({
      title: "テストノード",
      content: "内容",
      parentId: "parent-id",
    });
    expect(result.success).toBe(true);
  });

  it("title のみでも受け付ける (content はデフォルト値あり)", () => {
    const result = CreateNodeDto.safeParse({
      title: "テストノード",
    });
    expect(result.success).toBe(true);
  });

  it("title が空白のみだと拒否する", () => {
    const result = CreateNodeDto.safeParse({
      title: "   ",
      content: "内容",
    });
    expect(result.success).toBe(false);
  });

  it("title がないと拒否する", () => {
    const result = CreateNodeDto.safeParse({
      content: "内容のみ",
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdateNodeDto", () => {
  it("title のみの部分更新を受け付ける", () => {
    const result = UpdateNodeDto.safeParse({
      title: "更新タイトル",
    });
    expect(result.success).toBe(true);
  });

  it("content のみの部分更新を受け付ける", () => {
    const result = UpdateNodeDto.safeParse({
      content: "更新内容",
    });
    expect(result.success).toBe(true);
  });

  it("空オブジェクトを受け付ける (全フィールドがオプショナル)", () => {
    const result = UpdateNodeDto.safeParse({});
    expect(result.success).toBe(true);
  });
});
