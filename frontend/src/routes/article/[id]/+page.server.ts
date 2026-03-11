import type { PageServerLoad } from "./$types";
import type { NodeResponse } from "$lib/api/types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const response = await fetch(`/api/node/${params.id}`);
  if (!response.ok) {
    error(404, "ノードが見つかりません");
  }

  const node: NodeResponse = await response.json();

  const childrenResponse = await fetch(`/api/node/${params.id}/children`);
  const children: NodeResponse[] = childrenResponse.ok
    ? await childrenResponse.json()
    : [];

  return { node, children };
};
