<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import type { TagResponse, NodeResponse } from "$lib/api/types";

  type Props = {
    tags: TagResponse[];
    rootNodes: NodeResponse[];
  };

  const { tags, rootNodes }: Props = $props();

  let dateFrom = $state(page.url.searchParams.get("from") ?? "");
  let dateTo = $state(page.url.searchParams.get("to") ?? "");

  const selectedTagIds = $derived(page.url.searchParams.getAll("tagId"));

  const selectedParentId = $derived(
    page.url.searchParams.get("parentId") ?? "",
  );

  const sortBy = $derived(page.url.searchParams.get("sort") ?? "updatedAt");

  const groupBy = $derived(page.url.searchParams.get("group") ?? "none");

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    for (const tagId of selectedTagIds) {
      params.append("tagId", tagId);
    }
    if (selectedParentId) params.set("parentId", selectedParentId);
    params.set("sort", sortBy);
    params.set("group", groupBy);
    void goto(`/timeline?${params.toString()}`);
  };

  const handleTagToggle = (tagId: string) => {
    const params = new URLSearchParams(page.url.searchParams);
    const currentTags = params.getAll("tagId");
    params.delete("tagId");

    if (currentTags.includes(tagId)) {
      for (const tid of currentTags.filter((t) => t !== tagId)) {
        params.append("tagId", tid);
      }
    } else {
      for (const tid of currentTags) {
        params.append("tagId", tid);
      }
      params.append("tagId", tagId);
    }

    void goto(`/timeline?${params.toString()}`);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(page.url.searchParams);
    params.set("sort", newSort);
    void goto(`/timeline?${params.toString()}`);
  };

  const handleGroupChange = (newGroup: string) => {
    const params = new URLSearchParams(page.url.searchParams);
    params.set("group", newGroup);
    void goto(`/timeline?${params.toString()}`);
  };

  const handleParentChange = (parentId: string) => {
    const params = new URLSearchParams(page.url.searchParams);
    if (parentId) {
      params.set("parentId", parentId);
    } else {
      params.delete("parentId");
    }
    void goto(`/timeline?${params.toString()}`);
  };

  const handleClearFilters = () => {
    void goto("/timeline");
  };
</script>

<div class="space-y-4 rounded-lg border p-4">
  <div class="flex items-center justify-between">
    <h3 class="text-sm font-semibold">フィルタ</h3>
    <button
      onclick={handleClearFilters}
      class="text-primary text-xs hover:underline"
    >
      クリア
    </button>
  </div>

  <div class="grid grid-cols-2 gap-3">
    <div>
      <label for="date-from" class="mb-1 block text-xs font-medium">
        開始日
      </label>
      <input
        id="date-from"
        type="date"
        bind:value={dateFrom}
        onchange={applyFilters}
        class="border-input bg-background w-full rounded-md border px-2 py-1 text-sm"
      />
    </div>
    <div>
      <label for="date-to" class="mb-1 block text-xs font-medium">
        終了日
      </label>
      <input
        id="date-to"
        type="date"
        bind:value={dateTo}
        onchange={applyFilters}
        class="border-input bg-background w-full rounded-md border px-2 py-1 text-sm"
      />
    </div>
  </div>

  <div>
    <p class="mb-1.5 text-xs font-medium">タグ</p>
    <div class="flex flex-wrap gap-1.5">
      {#each tags as tag (tag.id)}
        <button
          onclick={() => handleTagToggle(tag.id)}
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

  <div>
    <label for="parent-filter" class="mb-1 block text-xs font-medium">
      親ノード
    </label>
    <select
      id="parent-filter"
      value={selectedParentId}
      onchange={(e) => handleParentChange(e.currentTarget.value)}
      class="border-input bg-background w-full rounded-md border px-2 py-1 text-sm"
    >
      <option value="">全て</option>
      {#each rootNodes as node (node.id)}
        <option value={node.id}>{node.title}</option>
      {/each}
    </select>
  </div>

  <div class="flex gap-3">
    <div class="flex-1">
      <p class="mb-1.5 text-xs font-medium">ソート</p>
      <div class="flex gap-1">
        <Button
          variant={sortBy === "updatedAt" ? "default" : "outline"}
          size="sm"
          class="flex-1 text-xs"
          onclick={() => handleSortChange("updatedAt")}
        >
          更新日
        </Button>
        <Button
          variant={sortBy === "createdAt" ? "default" : "outline"}
          size="sm"
          class="flex-1 text-xs"
          onclick={() => handleSortChange("createdAt")}
        >
          作成日
        </Button>
      </div>
    </div>

    <div class="flex-1">
      <p class="mb-1.5 text-xs font-medium">グループ</p>
      <div class="flex gap-1">
        <Button
          variant={groupBy === "none" ? "default" : "outline"}
          size="sm"
          class="flex-1 text-xs"
          onclick={() => handleGroupChange("none")}
        >
          なし
        </Button>
        <Button
          variant={groupBy === "parent" ? "default" : "outline"}
          size="sm"
          class="flex-1 text-xs"
          onclick={() => handleGroupChange("parent")}
        >
          親ノード
        </Button>
      </div>
    </div>
  </div>
</div>
