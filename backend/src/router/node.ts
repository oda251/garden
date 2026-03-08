import { router, publicProcedure } from "../trpc";

export const nodeRouter = router({
  list: publicProcedure.query(() => {
    return [];
  }),
});
