import type { InferSelectModel } from "drizzle-orm";
import type { nodes } from "../tables/nodes";

type NodeRow = InferSelectModel<typeof nodes>;

export const Node = {
  isRoot: (node: NodeRow): boolean => node.parentId === null,
} as const;
