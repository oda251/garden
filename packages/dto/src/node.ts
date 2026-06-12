import { z } from "zod";
import {
  NodeInsertBaseSchema,
  NodeSelectSchema,
  isNonBlankTitle,
} from "@garden/schema";

export const CreateNodeDto = NodeInsertBaseSchema.pick({
  title: true,
  content: true,
  parentId: true,
}).refine((data) => isNonBlankTitle(data.title), {
  message: "タイトルは空白のみにできません",
  path: ["title"],
});

export type CreateNodeDto = z.infer<typeof CreateNodeDto>;

export const UpdateNodeDto = NodeInsertBaseSchema.pick({
  title: true,
  content: true,
})
  .partial()
  .superRefine((data, ctx) => {
    if (data.title !== undefined && !isNonBlankTitle(data.title)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "タイトルは空白のみにできません",
        path: ["title"],
      });
    }
  });

export type UpdateNodeDto = z.infer<typeof UpdateNodeDto>;

export const NodeResponseDto = NodeSelectSchema;

export type NodeResponseDto = z.infer<typeof NodeResponseDto>;
