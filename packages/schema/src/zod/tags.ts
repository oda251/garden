import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { tags } from "../tables/tags";

export const TagSelectSchema = createSelectSchema(tags);

export const TagInsertSchema = createInsertSchema(tags);
