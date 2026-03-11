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
  import type { NodeResponse } from "$lib/api/types";

  const { data }: { data: { nodes: NodeResponse[] } } = $props();

  const flowNodes = $derived(nodesToFlowNodes(data.nodes));
  const flowEdges = $derived(nodesToFlowEdges(data.nodes));
</script>

<div class="relative h-[calc(100vh-3.5rem-2rem)] w-full">
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
