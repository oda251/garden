import type { Node, Edge } from "@xyflow/svelte";

type NodeData = {
  id: string;
  title: string;
  parentId: string | null;
  content: string;
  createdAt: string;
};

export const nodesToFlowNodes = (nodeDataList: NodeData[]): Node[] => {
  const HORIZONTAL_GAP = 250;
  const VERTICAL_GAP = 100;

  const childrenMap = new Map<string | null, NodeData[]>();
  for (const node of nodeDataList) {
    const parentKey = node.parentId ?? null;
    const existing = childrenMap.get(parentKey) ?? [];
    existing.push(node);
    childrenMap.set(parentKey, existing);
  }

  const rootNodes = childrenMap.get(null) ?? [];

  const flowNodes: Node[] = [];
  let currentX = 0;

  const layoutNode = (
    nodeData: NodeData,
    depth: number,
    xOffset: number,
  ): number => {
    flowNodes.push({
      id: nodeData.id,
      position: { x: xOffset, y: depth * VERTICAL_GAP },
      data: { label: nodeData.title },
      type: "default",
    });

    const children = childrenMap.get(nodeData.id) ?? [];
    let childX = xOffset;
    for (const child of children) {
      childX = layoutNode(child, depth + 1, childX) + HORIZONTAL_GAP;
    }

    return Math.max(xOffset, childX - HORIZONTAL_GAP);
  };

  for (const root of rootNodes) {
    currentX = layoutNode(root, 0, currentX) + HORIZONTAL_GAP;
  }

  return flowNodes;
};

export const nodesToFlowEdges = (nodeDataList: NodeData[]): Edge[] => {
  return nodeDataList
    .filter((node) => node.parentId !== null)
    .map((node) => ({
      id: `edge-${node.parentId}-${node.id}`,
      source: node.parentId ?? "",
      target: node.id,
      type: "smoothstep",
    }));
};
