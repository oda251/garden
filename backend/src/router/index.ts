import { router } from "../trpc";
import { nodeRouter } from "./node";
import { tagRouter } from "./tag";

export const appRouter = router({
  node: nodeRouter,
  tag: tagRouter,
});

export type AppRouter = typeof appRouter;
