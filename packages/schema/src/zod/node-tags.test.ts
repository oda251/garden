import { describe, it, expect } from "vitest";
import { NodeTagSelectSchema, NodeTagInsertSchema } from "./node-tags.js";

describe("NodeTagSelectSchema", () => {
  const validNodeTag = {
    nodeId: "node-1",
    tagId: "tag-1",
  };

  it("有効なデータを受け付ける", () => {
    const result = NodeTagSelectSchema.safeParse(validNodeTag);
    expect(result.success).toBe(true);
  });

  it("nodeId が欠けていると拒否する", () => {
    const { nodeId: _, ...withoutNodeId } = validNodeTag;
    const result = NodeTagSelectSchema.safeParse(withoutNodeId);
    expect(result.success).toBe(false);
  });

  it("tagId が欠けていると拒否する", () => {
    const { tagId: _, ...withoutTagId } = validNodeTag;
    const result = NodeTagSelectSchema.safeParse(withoutTagId);
    expect(result.success).toBe(false);
  });
});

describe("NodeTagInsertSchema", () => {
  const validNodeTag = {
    nodeId: "node-1",
    tagId: "tag-1",
  };

  it("有効なデータを受け付ける", () => {
    const result = NodeTagInsertSchema.safeParse(validNodeTag);
    expect(result.success).toBe(true);
  });

  it("nodeId が欠けていると拒否する", () => {
    const { nodeId: _, ...withoutNodeId } = validNodeTag;
    const result = NodeTagInsertSchema.safeParse(withoutNodeId);
    expect(result.success).toBe(false);
  });

  it("tagId が欠けていると拒否する", () => {
    const { tagId: _, ...withoutTagId } = validNodeTag;
    const result = NodeTagInsertSchema.safeParse(withoutTagId);
    expect(result.success).toBe(false);
  });
});
