import type { PageServerLoad } from "./$types";
import type { NodeResponse, TagResponse } from "$lib/api/types";

export const load: PageServerLoad = async ({ fetch }) => {
  const [nodesRes, tagsRes] = await Promise.all([
    fetch("/api/node/list"),
    fetch("/api/tag/list"),
  ]);

  const nodes: NodeResponse[] = nodesRes.ok ? await nodesRes.json() : [];
  const tags: TagResponse[] = tagsRes.ok ? await tagsRes.json() : [];

  return { nodes, tags };
};
