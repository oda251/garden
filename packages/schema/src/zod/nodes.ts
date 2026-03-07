import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { nodes } from "../tables/nodes.js";

export const NodeSelectSchema = createSelectSchema(nodes);

export const NodeInsertSchema = createInsertSchema(nodes);
