import type { PageServerLoad } from "./$types";
import type { NodeResponse, TagResponse } from "$lib/api/types";

export const load: PageServerLoad = async ({ fetch: kitFetch, url }) => {
  const parentId = url.searchParams.get("parentId");

  const nodeUrl = parentId
    ? `/api/node/list?parentId=${parentId}`
    : "/api/node/list";

  const [nodesRes, tagsRes] = await Promise.all([
    kitFetch(nodeUrl),
    kitFetch("/api/tag/list"),
  ]);

  const nodes: NodeResponse[] = nodesRes.ok ? await nodesRes.json() : [];
  const tags: TagResponse[] = tagsRes.ok ? await tagsRes.json() : [];

  const rootNodes = nodes.filter((node) => node.parentId === null);

  const tagIds = url.searchParams.getAll("tagId");
  const nodeTagMap: Record<string, TagResponse[]> = {};

  if (tagIds.length > 0) {
    const tagFetchResults = await Promise.all(
      nodes.map(async (node) => {
        const response = await kitFetch(`/api/tag/node/${node.id}`);
        const nodeTags: TagResponse[] = response.ok
          ? await response.json()
          : [];
        return { nodeId: node.id, tags: nodeTags };
      }),
    );

    for (const result of tagFetchResults) {
      nodeTagMap[result.nodeId] = result.tags;
    }
  }

  return { nodes, tags, rootNodes, tagIds, nodeTagMap };
};
