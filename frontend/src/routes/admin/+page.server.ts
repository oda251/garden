import type { PageServerLoad } from "./$types";
import type { UserResponse } from "$lib/api/types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ fetch, parent }) => {
  const parentData = await parent();
  if (parentData.session?.user?.role !== "admin") {
    redirect(302, "/graph");
  }

  const response = await fetch("/api/admin/users");
  if (!response.ok) {
    return { users: [] as UserResponse[] };
  }
  const users: UserResponse[] = await response.json();
  return { users };
};
