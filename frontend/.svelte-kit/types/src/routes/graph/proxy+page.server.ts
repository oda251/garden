// @ts-nocheck
import type { PageServerLoad } from "./$types";
import type { NodeResponse } from "$lib/api/types";

export const load = async ({ fetch }: Parameters<PageServerLoad>[0]) => {
  const response = await fetch("/api/node/list");
  if (!response.ok) {
    return { nodes: [] as NodeResponse[] };
  }
  const nodes: NodeResponse[] = await response.json();
  return { nodes };
};
