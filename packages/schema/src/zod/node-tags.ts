import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { nodeTags } from "../tables/node-tags.js";

export const NodeTagSelectSchema = createSelectSchema(nodeTags);

export const NodeTagInsertSchema = createInsertSchema(nodeTags);
