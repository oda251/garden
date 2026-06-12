import { createAuthClient } from "better-auth/svelte";
import { getBaseUrl } from "./client";

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
});
