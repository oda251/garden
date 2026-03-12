<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";
  import { invalidateAll } from "$app/navigation";
  import X from "@lucide/svelte/icons/x";
  import Plus from "@lucide/svelte/icons/plus";
  import type { TagResponse } from "$lib/api/types";

  type Props = {
    nodeId: string;
    assignedTags: TagResponse[];
    allTags: TagResponse[];
  };

  const { nodeId, assignedTags, allTags }: Props = $props();

  let isOpen = $state(false);

  const availableTags = $derived(
    allTags.filter(
      (tag) => !assignedTags.some((assigned) => assigned.id === tag.id),
    ),
  );

  const handleAssignTag = async (tagId: string) => {
    const response = await fetch("/api/tag/node", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeId, tagId }),
    });

    if (response.ok) {
      toast.success("タグを付与しました");
      await invalidateAll();
    } else {
      toast.error("タグの付与に失敗しました");
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    const response = await fetch("/api/tag/node", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeId, tagId }),
    });

    if (response.ok) {
      toast.success("タグを解除しました");
      await invalidateAll();
    } else {
      toast.error("タグの解除に失敗しました");
    }
  };
</script>

<div class="space-y-2">
  <div class="flex flex-wrap gap-1.5">
    {#each assignedTags as tag (tag.id)}
      <span
        class="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs"
      >
        {tag.name}
        <button
          onclick={() => handleRemoveTag(tag.id)}
          class="hover:text-destructive rounded-full transition-colors"
        >
          <X class="h-3 w-3" />
        </button>
      </span>
    {/each}

    <Button
      variant="outline"
      size="sm"
      class="h-6 px-2 text-xs"
      onclick={() => (isOpen = !isOpen)}
    >
      <Plus class="mr-1 h-3 w-3" />
      タグ追加
    </Button>
  </div>

  {#if isOpen && availableTags.length > 0}
    <div class="border-border rounded-md border p-2">
      <p class="text-muted-foreground mb-2 text-xs">タグを選択</p>
      <div class="flex flex-wrap gap-1.5">
        {#each availableTags as tag (tag.id)}
          <button
            onclick={() => handleAssignTag(tag.id)}
            class="bg-muted hover:bg-accent rounded-full px-2.5 py-0.5 text-xs transition-colors"
          >
            {tag.name}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  {#if isOpen && availableTags.length === 0}
    <p class="text-muted-foreground text-xs">付与可能なタグがありません。</p>
  {/if}
</div>
