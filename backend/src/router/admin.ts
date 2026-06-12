import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { users } from "@garden/schema";
import { UpdateUserRoleDto } from "@garden/dto";
import { requireAuth, requireAdmin } from "../auth/index.js";
import { AppError } from "../domain/app-error.js";
import type { AppEnv, AppVariables } from "../env.js";

type AdminEnv = {
  Bindings: AppEnv;
  Variables: AppVariables;
};

export const adminRouter = new Hono<AdminEnv>()
  .use("*", requireAuth, requireAdmin)
  .get("/users", async (c) => {
    const db = c.get("db");
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users);

    return c.json(result);
  })
  .put("/users/:id/role", zValidator("json", UpdateUserRoleDto), async (c) => {
    const db = c.get("db");
    const userId = c.req.param("id");
    const { role } = c.req.valid("json");

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existing[0]) {
      const { status: notFoundStatus, body: notFoundBody } =
        AppError.toResponse(AppError.notFound("User not found"));
      return c.json(notFoundBody, notFoundStatus);
    }

    await db.update(users).set({ role }).where(eq(users.id, userId));

    return c.json({ success: true });
  });
