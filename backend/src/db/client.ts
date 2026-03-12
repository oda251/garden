import { drizzle } from "drizzle-orm/d1";
import * as schema from "@garden/schema";

export const createDb = (d1: D1Database) =>
  drizzle(d1, { schema, logger: false });

export type Database = ReturnType<typeof createDb>;
