<script lang="ts">
  import {
    SvelteFlow,
    Controls,
    Background,
    BackgroundVariant,
    MiniMap,
  } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import { nodesToFlowNodes, nodesToFlowEdges } from "$lib/components/graph";
  import { NodeCreateDialog } from "$lib/components/node";
  import { TagList } from "$lib/components/tag";
  import type { NodeResponse, TagResponse } from "$lib/api/types";

  const { data }: { data: { nodes: NodeResponse[]; tags: TagResponse[] } } =
    $props();

  const flowNodes = $derived(nodesToFlowNodes(data.nodes));
  const flowEdges = $derived(nodesToFlowEdges(data.nodes));
</script>

<div class="flex h-[calc(100vh-3.5rem-2rem)]">
  <aside class="border-border w-64 overflow-y-auto border-r p-4">
    <TagList tags={data.tags} />
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
      <SvelteFlow nodes={flowNodes} edges={flowEdges} fitView>
        <Controls />
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap />
      </SvelteFlow>
    {/if}
  </div>
</div>
