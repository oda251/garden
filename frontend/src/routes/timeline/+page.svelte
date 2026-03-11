<script lang="ts">
  import type { NodeResponse } from "$lib/api/types";

  const { data }: { data: { nodes: NodeResponse[] } } = $props();

  const sortedNodes = $derived(
    [...data.nodes].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    ),
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
</script>

<div class="mx-auto max-w-3xl space-y-4">
  <h2 class="text-xl font-bold">タイムライン</h2>

  {#if sortedNodes.length === 0}
    <p class="text-muted-foreground">ノードがありません。</p>
  {:else}
    <div class="space-y-3">
      {#each sortedNodes as node (node.id)}
        <a
          href="/article/{node.id}"
          class="border-border hover:bg-accent block rounded-lg border p-4 transition-colors"
        >
          <h3 class="font-semibold">{node.title}</h3>
          <p class="text-muted-foreground mt-1 line-clamp-2 text-sm">
            {node.content || "(内容なし)"}
          </p>
          <p class="text-muted-foreground mt-2 text-xs">
            更新: {formatDate(node.updatedAt)}
          </p>
        </a>
      {/each}
    </div>
  {/if}
</div>
