import { CreateNodeDto } from "@garden/dto";

export const CreateNodeValidation = CreateNodeDto.refine(
  (data) => data.title.trim().length > 0,
  {
    message: "タイトルは空白のみにできません",
    path: ["title"],
  },
);
