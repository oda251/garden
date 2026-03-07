import { fake, seed } from "zod-schema-faker/v4";
import {
  NodeInsertSchema,
  UserInsertSchema,
  TagInsertSchema,
} from "@garden/schema";

seed(42);

export const createMockNode = () => fake(NodeInsertSchema);

export const createMockUser = () => fake(UserInsertSchema);

export const createMockTag = () => fake(TagInsertSchema);
