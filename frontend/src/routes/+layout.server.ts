import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch }) => {
  const response = await fetch("/api/auth/get-session", {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    return { session: null };
  }

  const session = await response.json();
  return { session };
};
