import { z } from "zod";
import { TagInsertSchema, TagSelectSchema } from "@garden/schema";

export const CreateTagDto = TagInsertSchema.pick({
  name: true,
});

export type CreateTagDto = z.infer<typeof CreateTagDto>;

export const TagResponseDto = TagSelectSchema;

export type TagResponseDto = z.infer<typeof TagResponseDto>;
