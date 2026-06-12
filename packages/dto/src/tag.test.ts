import { describe, it, expect } from "vitest";
import { CreateTagDto, TagResponseDto } from "./tag.js";

describe("CreateTagDto", () => {
  it("有効な name を受け付ける", () => {
    const result = CreateTagDto.safeParse({ name: "typescript" });
    expect(result.success).toBe(true);
  });

  it("name がないと拒否する", () => {
    const result = CreateTagDto.safeParse({});
    expect(result.success).toBe(false);
  });

  it("余分なフィールドは無視する", () => {
    const result = CreateTagDto.safeParse({
      name: "typescript",
      extra: "ignored",
    });
    expect(result.success).toBe(true);
  });
});

describe("TagResponseDto", () => {
  it("有効なレスポンスデータをパースできる", () => {
    const result = TagResponseDto.safeParse({
      id: "tag-1",
      name: "typescript",
    });
    expect(result.success).toBe(true);
  });

  it("必須フィールドが欠けていると拒否する", () => {
    const result = TagResponseDto.safeParse({});
    expect(result.success).toBe(false);
  });
});
