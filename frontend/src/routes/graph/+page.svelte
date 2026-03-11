<script lang="ts">
  import {
    SvelteFlow,
    Controls,
    Background,
    BackgroundVariant,
    MiniMap,
  } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import {
    nodesToFlowNodes,
    nodesToFlowEdges,
    NodeDetailPanel,
  } from "$lib/components/graph";
  import { NodeCreateDialog } from "$lib/components/node";
  import { TagList } from "$lib/components/tag";
  import type { NodeResponse, TagResponse } from "$lib/api/types";
  import type { NodeMouseHandler } from "@xyflow/svelte";

  type PageData = {
    nodes: NodeResponse[];
    tags: TagResponse[];
    session: { user: { id: string; role: string } } | null;
  };

  const { data }: { data: PageData } = $props();

  let selectedNodeId = $state<string | null>(null);
  let selectedTagIds = $state<string[]>([]);
  let nodeTags = $state<Record<string, TagResponse[]>>({});

  const filteredNodes = $derived(
    selectedTagIds.length === 0
      ? data.nodes
      : data.nodes.filter((node) => {
          const tags = nodeTags[node.id] ?? [];
          return selectedTagIds.some((tagId) =>
            tags.some((tag) => tag.id === tagId),
          );
        }),
  );

  const flowNodes = $derived(nodesToFlowNodes(filteredNodes));
  const flowEdges = $derived(nodesToFlowEdges(filteredNodes));

  const selectedNode = $derived(
    data.nodes.find((node) => node.id === selectedNodeId) ?? null,
  );

  const selectedNodeAssignedTags = $derived(
    selectedNodeId ? (nodeTags[selectedNodeId] ?? []) : [],
  );

  const canEditSelectedNode = $derived(
    data.session?.user?.role === "admin" ||
      data.session?.user?.id === selectedNode?.createdBy,
  );

  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    selectedNodeId = node.id;
    void fetchNodeTags(node.id);
  };

  const fetchNodeTags = async (nodeId: string) => {
    const response = await fetch(`/api/tag/node/${nodeId}`);
    if (response.ok) {
      const tags: TagResponse[] = await response.json();
      nodeTags = { ...nodeTags, [nodeId]: tags };
    }
  };

  const handleTagFilter = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      selectedTagIds = selectedTagIds.filter((id) => id !== tagId);
    } else {
      selectedTagIds = [...selectedTagIds, tagId];
    }
  };

  const handleClearFilter = () => {
    selectedTagIds = [];
  };
</script>

<div class="flex h-[calc(100vh-3.5rem-2rem)]">
  <aside class="border-border w-64 overflow-y-auto border-r p-4">
    <div class="mb-4">
      <TagList tags={data.tags} />
    </div>

    <div class="border-border border-t pt-4">
      <h3 class="mb-2 text-sm font-semibold">タグフィルタ</h3>
      {#if selectedTagIds.length > 0}
        <button
          onclick={handleClearFilter}
          class="text-primary mb-2 text-xs hover:underline"
        >
          フィルタをクリア
        </button>
      {/if}
      <div class="flex flex-wrap gap-1.5">
        {#each data.tags as tag (tag.id)}
          <button
            onclick={() => handleTagFilter(tag.id)}
            class="rounded-full px-2.5 py-0.5 text-xs transition-colors {selectedTagIds.includes(
              tag.id,
            )
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-accent'}"
          >
            {tag.name}
          </button>
        {/each}
      </div>
    </div>
  </aside>

  <div class="relative flex-1">
    <div class="absolute top-4 right-4 z-10">
      <NodeCreateDialog />
    </div>

    {#if data.nodes.length === 0}
      <div class="flex h-full items-center justify-center">
        <div class="text-center">
          <p class="text-muted-foreground mb-4">
            ノードがありません。最初のノードを作成してください。
          </p>
          <NodeCreateDialog />
        </div>
      </div>
    {:else}
      <SvelteFlow
        nodes={flowNodes}
        edges={flowEdges}
        fitView
        onNodeClick={handleNodeClick}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap />
      </SvelteFlow>
    {/if}
  </div>

  {#if selectedNode}
    <NodeDetailPanel
      node={selectedNode}
      assignedTags={selectedNodeAssignedTags}
      allTags={data.tags}
      canEdit={canEditSelectedNode}
      onClose={() => (selectedNodeId = null)}
    />
  {/if}
</div>
