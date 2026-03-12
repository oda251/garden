// @ts-nocheck
import type { LayoutServerLoad } from "./$types";

type SessionData = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
} | null;

export const load = async ({ fetch }: Parameters<LayoutServerLoad>[0]) => {
  const response = await fetch("/api/auth/get-session", {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    return { session: null satisfies SessionData };
  }

  const session: SessionData = await response.json();
  return { session };
};
