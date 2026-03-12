import { describe, it, expect } from "vitest";
import { Node } from "./node.js";

describe("Node companion", () => {
  const baseNode = {
    id: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    title: "test",
    content: "",
    parentId: null,
    createdBy: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };

  describe("isRoot", () => {
    it("parentId が null ならルートノード", () => {
      expect(Node.isRoot({ ...baseNode, parentId: null })).toBe(true);
    });

    it("parentId が存在すればルートノードではない", () => {
      expect(Node.isRoot({ ...baseNode, parentId: "parent-id" })).toBe(false);
    });
  });
});
