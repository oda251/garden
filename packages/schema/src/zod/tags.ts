import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { tags } from "../tables/tags.js";

export const TagSelectSchema = createSelectSchema(tags);

export const TagInsertSchema = createInsertSchema(tags);
