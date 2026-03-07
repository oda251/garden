import { initTRPC } from "@trpc/server";

export type TRPCContext = {
  env: Env;
};

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
