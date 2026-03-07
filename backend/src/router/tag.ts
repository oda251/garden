import { router, publicProcedure } from "../trpc.js";

export const tagRouter = router({
  list: publicProcedure.query(() => {
    return [];
  }),
});
