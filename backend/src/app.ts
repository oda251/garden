import { Hono } from "hono";
import { cors } from "hono/cors";
import { apiRouter } from "./router/index.js";
import { errorHandler, dbMiddleware } from "./middleware/index.js";
import type { AppEnv, AppVariables } from "./env.js";

const app = new Hono<{ Bindings: AppEnv; Variables: AppVariables }>();

app.onError(errorHandler);

app.use("*", cors());
app.use("/api/*", dbMiddleware);

app.get("/health", (c) => c.json({ status: "ok" }));

const routes = app.route("/api", apiRouter);

export default app;
export type AppRoutes = typeof routes;
