import { describe, it, expect } from "vitest";
import { CreateTagDto } from "./tag.js";

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
