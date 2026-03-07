import { router, publicProcedure } from "../trpc.js";

export const nodeRouter = router({
  list: publicProcedure.query(() => {
    return [];
  }),
});
