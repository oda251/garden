import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users.js";

export const nodes = sqliteTable("nodes", {
  id: text("id").primaryKey(),
  parentId: text("parent_id").references((): AnySQLiteColumn => nodes.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  createdBy: text("created_by").references(() => users.id),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
