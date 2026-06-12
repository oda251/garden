import { describe, it, expect } from "vitest";
import { TagSelectSchema, TagInsertSchema } from "./tags.js";

describe("TagSelectSchema", () => {
  const validTag = {
    id: "tag-1",
    name: "TypeScript",
  };

  it("有効なデータを受け付ける", () => {
    const result = TagSelectSchema.safeParse(validTag);
    expect(result.success).toBe(true);
  });

  it("id が欠けていると拒否する", () => {
    const { id: _, ...withoutId } = validTag;
    const result = TagSelectSchema.safeParse(withoutId);
    expect(result.success).toBe(false);
  });

  it("name が欠けていると拒否する", () => {
    const { name: _, ...withoutName } = validTag;
    const result = TagSelectSchema.safeParse(withoutName);
    expect(result.success).toBe(false);
  });
});

describe("TagInsertSchema", () => {
  const validTag = {
    id: "tag-1",
    name: "TypeScript",
  };

  it("有効なデータを受け付ける", () => {
    const result = TagInsertSchema.safeParse(validTag);
    expect(result.success).toBe(true);
  });

  it("id が欠けていると拒否する", () => {
    const { id: _, ...withoutId } = validTag;
    const result = TagInsertSchema.safeParse(withoutId);
    expect(result.success).toBe(false);
  });

  it("name が欠けていると拒否する", () => {
    const { name: _, ...withoutName } = validTag;
    const result = TagInsertSchema.safeParse(withoutName);
    expect(result.success).toBe(false);
  });
});
