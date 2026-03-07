import { router } from "../trpc.js";
import { nodeRouter } from "./node.js";
import { tagRouter } from "./tag.js";

export const appRouter = router({
  node: nodeRouter,
  tag: tagRouter,
});

export type AppRouter = typeof appRouter;
