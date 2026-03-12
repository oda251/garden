import type { Handle } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";

const PUBLIC_PATHS = ["/login", "/api/auth"];

export const handle: Handle = async ({ event, resolve }) => {
  const isPublicPath = PUBLIC_PATHS.some((path) =>
    event.url.pathname.startsWith(path),
  );

  if (!isPublicPath) {
    const sessionResponse = await event.fetch("/api/auth/get-session", {
      headers: { accept: "application/json" },
    });

    if (!sessionResponse.ok) {
      redirect(302, "/login");
    }

    const session: { user?: unknown } = await sessionResponse.json();
    if (!session.user) {
      redirect(302, "/login");
    }
  }

  return resolve(event);
};
