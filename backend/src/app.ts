import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./router/index.js";
import type { TRPCContext } from "./trpc.js";
import type { AppEnv } from "./env.js";

const app = new Hono<{ Bindings: AppEnv }>();

app.use("*", cors());

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, c): TRPCContext => ({
      env: c.env,
    }),
  }),
);

app.get("/health", (c) => c.json({ status: "ok" }));

export default app;
