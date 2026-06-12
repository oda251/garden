import { Hono } from "hono";
import { apiRouter } from "./router/index.js";
import {
  errorHandler,
  dbMiddleware,
  authSetupMiddleware,
  secureHeadersMiddleware,
  csrfMiddleware,
  corsMiddleware,
} from "./middleware/index.js";
import { authMiddleware } from "./auth/index.js";
import type { AppEnv, AppVariables } from "./env.js";

const app = new Hono<{ Bindings: AppEnv; Variables: AppVariables }>();

app.onError(errorHandler);

app.use("*", secureHeadersMiddleware);
app.use("*", corsMiddleware);
app.use("*", csrfMiddleware);
app.use("*", dbMiddleware);
app.use("*", authSetupMiddleware);

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  const auth = c.get("auth");
  return auth.handler(c.req.raw);
});

app.use("/api/*", authMiddleware);

app.get("/health", (c) => c.json({ status: "ok" }));

const routes = app.route("/api", apiRouter);

export default app;
export type AppRoutes = typeof routes;
