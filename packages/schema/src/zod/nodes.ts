import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { nodes } from "../tables/nodes.js";

export const isNonBlankTitle = (title: string) => title.trim().length > 0;

export const NodeSelectSchema = createSelectSchema(nodes);

export const NodeInsertBaseSchema = createInsertSchema(nodes);

export const NodeInsertSchema = NodeInsertBaseSchema.refine(
  (data) => isNonBlankTitle(data.title),
  { message: "タイトルは空白のみにできません", path: ["title"] },
);
