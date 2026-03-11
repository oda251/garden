import type { Database } from "./db/index.js";

export type AppEnv = {
  DB: D1Database;
};

export type AppVariables = {
  db: Database;
};
