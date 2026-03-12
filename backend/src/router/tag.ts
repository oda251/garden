import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { ulid } from "ulid";
import { tags, nodeTags } from "@garden/schema";
import { CreateTagDto } from "@garden/dto";
import { requireAuth } from "../auth/index.js";
import type { AppEnv, AppVariables } from "../env.js";

type TagEnv = {
  Bindings: AppEnv;
  Variables: AppVariables;
};

const nodeTagSchema = z.object({
  nodeId: z.string(),
  tagId: z.string(),
});

export const tagRouter = new Hono<TagEnv>()
  .get("/list", async (c) => {
    const db = c.get("db");
    const result = await db.select().from(tags);
    return c.json(result);
  })
  .post("/", requireAuth, zValidator("json", CreateTagDto), async (c) => {
    const db = c.get("db");
    const body = c.req.valid("json");

    const newTag = {
      id: ulid(),
      name: body.name,
    };

    await db.insert(tags).values(newTag);

    return c.json(newTag, 201);
  })
  .get("/node/:nodeId", async (c) => {
    const db = c.get("db");
    const nodeId = c.req.param("nodeId");

    const result = await db
      .select({ id: tags.id, name: tags.name })
      .from(nodeTags)
      .innerJoin(tags, eq(nodeTags.tagId, tags.id))
      .where(eq(nodeTags.nodeId, nodeId));

    return c.json(result);
  })
  .post("/node", requireAuth, zValidator("json", nodeTagSchema), async (c) => {
    const db = c.get("db");
    const { nodeId, tagId } = c.req.valid("json");

    await db.insert(nodeTags).values({ nodeId, tagId });

    return c.json({ success: true }, 201);
  })
  .delete(
    "/node",
    requireAuth,
    zValidator("json", nodeTagSchema),
    async (c) => {
      const db = c.get("db");
      const { nodeId, tagId } = c.req.valid("json");

      await db
        .delete(nodeTags)
        .where(and(eq(nodeTags.nodeId, nodeId), eq(nodeTags.tagId, tagId)));

      return c.json({ success: true });
    },
  )
  .delete("/:id", requireAuth, async (c) => {
    const db = c.get("db");
    const tagId = c.req.param("id");

    const existing = await db
      .select()
      .from(tags)
      .where(eq(tags.id, tagId))
      .limit(1);

    if (!existing[0]) {
      return c.json({ code: "NOT_FOUND", message: "Tag not found" }, 404);
    }

    await db.delete(tags).where(eq(tags.id, tagId));

    return c.json({ success: true });
  });
