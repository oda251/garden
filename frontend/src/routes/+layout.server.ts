import type { LayoutServerLoad } from "./$types";
import type { SessionData } from "$lib/api/types";

export const load: LayoutServerLoad = async ({ fetch }) => {
  const response = await fetch("/api/auth/get-session", {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    return { session: null satisfies SessionData };
  }

  const session: SessionData = await response.json();
  return { session };
};
