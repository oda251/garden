import type { PageServerLoad } from "./$types";
import type { NodeResponse, TagResponse } from "$lib/api/types";
import { error } from "@sveltejs/kit";

const fetchAncestors = async (
  nodeFetch: typeof fetch,
  parentId: string | null,
): Promise<NodeResponse[]> => {
  const ancestors: NodeResponse[] = [];
  let currentParentId = parentId;

  while (currentParentId) {
    const response = await nodeFetch(`/api/node/${currentParentId}`);
    if (!response.ok) break;

    const parent: NodeResponse = await response.json();
    ancestors.unshift(parent);
    currentParentId = parent.parentId;
  }

  return ancestors;
};

export const load: PageServerLoad = async ({ params, fetch: kitFetch }) => {
  const response = await kitFetch(`/api/node/${params.id}`);
  if (!response.ok) {
    error(404, "ノードが見つかりません");
  }

  const node: NodeResponse = await response.json();

  const [childrenResponse, tagsResponse, allTagsResponse, ancestors] =
    await Promise.all([
      kitFetch(`/api/node/${params.id}/children`),
      kitFetch(`/api/tag/node/${params.id}`),
      kitFetch("/api/tag/list"),
      fetchAncestors(kitFetch, node.parentId),
    ]);

  const children: NodeResponse[] = childrenResponse.ok
    ? await childrenResponse.json()
    : [];

  const nodeTags: TagResponse[] = tagsResponse.ok
    ? await tagsResponse.json()
    : [];

  const allTags: TagResponse[] = allTagsResponse.ok
    ? await allTagsResponse.json()
    : [];

  return { node, children, ancestors, nodeTags, allTags };
};
