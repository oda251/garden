import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { ulid } from "ulid";
import { nodes, ROLE } from "@garden/schema";
import { CreateNodeDto, UpdateNodeDto } from "@garden/dto";
import { requireAuth } from "../auth/index.js";
import type { AppEnv, AppVariables } from "../env.js";

type NodeEnv = {
  Bindings: AppEnv;
  Variables: AppVariables;
};

const listQuerySchema = z.object({
  parentId: z.string().optional(),
  tagId: z.string().optional(),
});

export const nodeRouter = new Hono<NodeEnv>()
  .get("/list", zValidator("query", listQuerySchema), async (c) => {
    const db = c.get("db");
    const { parentId } = c.req.valid("query");

    const conditions = [];
    if (parentId !== undefined) {
      conditions.push(eq(nodes.parentId, parentId));
    }

    const result =
      conditions.length > 0
        ? await db
            .select()
            .from(nodes)
            .where(and(...conditions))
        : await db.select().from(nodes);

    return c.json(result);
  })
  .get("/:id", async (c) => {
    const db = c.get("db");
    const nodeId = c.req.param("id");

    const result = await db
      .select()
      .from(nodes)
      .where(eq(nodes.id, nodeId))
      .limit(1);

    const node = result[0];
    if (!node) {
      return c.json({ code: "NOT_FOUND", message: "Node not found" }, 404);
    }

    return c.json(node);
  })
  .get("/:id/children", async (c) => {
    const db = c.get("db");
    const nodeId = c.req.param("id");

    const result = await db
      .select()
      .from(nodes)
      .where(eq(nodes.parentId, nodeId));

    return c.json(result);
  })
  .post("/", requireAuth, zValidator("json", CreateNodeDto), async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const body = c.req.valid("json");
    const now = new Date().toISOString();

    const newNode = {
      id: ulid(),
      title: body.title,
      content: body.content ?? "",
      parentId: body.parentId ?? null,
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(nodes).values(newNode);

    return c.json(newNode, 201);
  })
  .put("/:id", requireAuth, zValidator("json", UpdateNodeDto), async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const nodeId = c.req.param("id");
    const body = c.req.valid("json");

    const existing = await db
      .select()
      .from(nodes)
      .where(eq(nodes.id, nodeId))
      .limit(1);

    const node = existing[0];
    if (!node) {
      return c.json({ code: "NOT_FOUND", message: "Node not found" }, 404);
    }

    if (node.createdBy !== user.id && user.role !== ROLE.ADMIN) {
      return c.json({ code: "FORBIDDEN", message: "Forbidden" }, 403);
    }

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await db.update(nodes).set(updateData).where(eq(nodes.id, nodeId));

    const updated = await db
      .select()
      .from(nodes)
      .where(eq(nodes.id, nodeId))
      .limit(1);

    return c.json(updated[0]);
  })
  .delete("/:id", requireAuth, async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const nodeId = c.req.param("id");

    const existing = await db
      .select()
      .from(nodes)
      .where(eq(nodes.id, nodeId))
      .limit(1);

    const node = existing[0];
    if (!node) {
      return c.json({ code: "NOT_FOUND", message: "Node not found" }, 404);
    }

    if (node.createdBy !== user.id && user.role !== ROLE.ADMIN) {
      return c.json({ code: "FORBIDDEN", message: "Forbidden" }, 403);
    }

    await db.delete(nodes).where(eq(nodes.id, nodeId));

    return c.json({ success: true });
  });
