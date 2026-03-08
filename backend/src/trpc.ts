import { initTRPC } from "@trpc/server";
import type { AppEnv } from "./env";

export type TRPCContext = {
  env: AppEnv;
};

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
