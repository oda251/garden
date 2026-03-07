import { z } from "zod";
import { NodeInsertSchema, NodeSelectSchema } from "@garden/schema";

export const CreateNodeDto = NodeInsertSchema.pick({
  title: true,
  content: true,
  parentId: true,
});

export type CreateNodeDto = z.infer<typeof CreateNodeDto>;

export const UpdateNodeDto = NodeInsertSchema.pick({
  title: true,
  content: true,
}).partial();

export type UpdateNodeDto = z.infer<typeof UpdateNodeDto>;

export const NodeResponseDto = NodeSelectSchema;

export type NodeResponseDto = z.infer<typeof NodeResponseDto>;
