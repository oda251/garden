<script lang="ts">
  import { page } from "$app/state";
  import { TimelineFilter } from "$lib/components/timeline";
  import type { NodeResponse, TagResponse } from "$lib/api/types";

  type PageData = {
    nodes: NodeResponse[];
    tags: TagResponse[];
    rootNodes: NodeResponse[];
    tagIds: string[];
    nodeTagMap: Record<string, TagResponse[]>;
  };

  const { data }: { data: PageData } = $props();

  const sortBy = $derived(page.url.searchParams.get("sort") ?? "updatedAt");

  const groupBy = $derived(page.url.searchParams.get("group") ?? "none");

  const dateFrom = $derived(page.url.searchParams.get("from") ?? "");
  const dateTo = $derived(page.url.searchParams.get("to") ?? "");

  const filteredNodes = $derived(() => {
    let result = [...data.nodes];

    if (data.tagIds.length > 0) {
      result = result.filter((node) => {
        const nodeTags = data.nodeTagMap[node.id] ?? [];
        return data.tagIds.some((tagId) =>
          nodeTags.some((tag) => tag.id === tagId),
        );
      });
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      result = result.filter((node) => {
        const nodeDate = new Date(
          sortBy === "createdAt" ? node.createdAt : node.updatedAt,
        );
        return nodeDate >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((node) => {
        const nodeDate = new Date(
          sortBy === "createdAt" ? node.createdAt : node.updatedAt,
        );
        return nodeDate <= toDate;
      });
    }

    result.sort((a, b) => {
      const dateA = sortBy === "createdAt" ? a.createdAt : a.updatedAt;
      const dateB = sortBy === "createdAt" ? b.createdAt : b.updatedAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    return result;
  });

  const groupedNodes = $derived(() => {
    const nodes = filteredNodes();
    if (groupBy !== "parent") return null;

    const groups = new Map<string, { title: string; nodes: NodeResponse[] }>();
    const orphans: NodeResponse[] = [];

    for (const node of nodes) {
      if (node.parentId) {
        const parentNode = data.nodes.find((n) => n.id === node.parentId);
        const parentTitle = parentNode?.title ?? "不明な親ノード";
        const parentKey = node.parentId;

        const existing = groups.get(parentKey);
        if (existing) {
          existing.nodes.push(node);
        } else {
          groups.set(parentKey, { title: parentTitle, nodes: [node] });
        }
      } else {
        orphans.push(node);
      }
    }

    return { groups: Array.from(groups.entries()), orphans };
  });

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

  const getDisplayDate = (node: NodeResponse) => {
    return sortBy === "createdAt" ? node.createdAt : node.updatedAt;
  };

  const getDateLabel = () => {
    return sortBy === "createdAt" ? "作成" : "更新";
  };
</script>

<div class="mx-auto max-w-4xl space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-bold">タイムライン</h2>
    <span class="text-muted-foreground text-sm">
      {filteredNodes().length} 件
    </span>
  </div>

  <TimelineFilter tags={data.tags} rootNodes={data.rootNodes} />

  {#if filteredNodes().length === 0}
    <p class="text-muted-foreground py-8 text-center">
      条件に一致するノードがありません。
    </p>
  {:else if groupBy === "parent" && groupedNodes()}
    {@const grouped = groupedNodes()}
    {#if grouped}
      {#if grouped.orphans.length > 0}
        <div class="space-y-3">
          <h3 class="text-muted-foreground text-sm font-semibold">
            ルートノード
          </h3>
          {#each grouped.orphans as node (node.id)}
            <a
              href="/article/{node.id}"
              class="border-border hover:bg-accent block rounded-lg border p-4 transition-colors"
            >
              <h4 class="font-semibold">{node.title}</h4>
              <p class="text-muted-foreground mt-1 line-clamp-2 text-sm">
                {node.content || "(内容なし)"}
              </p>
              <p class="text-muted-foreground mt-2 text-xs">
                {getDateLabel()}: {formatDate(getDisplayDate(node))}
              </p>
            </a>
          {/each}
        </div>
      {/if}

      {#each grouped.groups as [parentId, group] (parentId)}
        <div class="space-y-3">
          <h3 class="text-muted-foreground text-sm font-semibold">
            {group.title}
          </h3>
          {#each group.nodes as node (node.id)}
            <a
              href="/article/{node.id}"
              class="border-border hover:bg-accent block rounded-lg border p-4 transition-colors"
            >
              <h4 class="font-semibold">{node.title}</h4>
              <p class="text-muted-foreground mt-1 line-clamp-2 text-sm">
                {node.content || "(内容なし)"}
              </p>
              <p class="text-muted-foreground mt-2 text-xs">
                {getDateLabel()}: {formatDate(getDisplayDate(node))}
              </p>
            </a>
          {/each}
        </div>
      {/each}
    {/if}
  {:else}
    <div class="space-y-3">
      {#each filteredNodes() as node (node.id)}
        <a
          href="/article/{node.id}"
          class="border-border hover:bg-accent block rounded-lg border p-4 transition-colors"
        >
          <h3 class="font-semibold">{node.title}</h3>
          <p class="text-muted-foreground mt-1 line-clamp-2 text-sm">
            {node.content || "(内容なし)"}
          </p>
          <p class="text-muted-foreground mt-2 text-xs">
            {getDateLabel()}: {formatDate(getDisplayDate(node))}
          </p>
        </a>
      {/each}
    </div>
  {/if}
</div>
