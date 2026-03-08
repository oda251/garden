import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nodes } from "./nodes";
import { tags } from "./tags";

export const nodeTags = sqliteTable(
  "node_tags",
  {
    nodeId: text("node_id")
      .notNull()
      .references(() => nodes.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.nodeId, table.tagId] })],
);
