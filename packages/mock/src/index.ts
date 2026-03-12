import { faker } from "@faker-js/faker";
import { fake, seed, setFaker } from "zod-schema-faker/v4";
import {
  NodeInsertBaseSchema,
  UserInsertSchema,
  TagInsertSchema,
} from "@garden/schema";

setFaker(faker);
seed(42);

export const createMockNode = () => fake(NodeInsertBaseSchema);

export const createMockUser = () => fake(UserInsertSchema);

export const createMockTag = () => fake(TagInsertSchema);
