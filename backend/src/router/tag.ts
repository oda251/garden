import { router, publicProcedure } from "../trpc";

export const tagRouter = router({
  list: publicProcedure.query(() => {
    return [];
  }),
});
