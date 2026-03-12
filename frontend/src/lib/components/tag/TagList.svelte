<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";
  import { invalidateAll } from "$app/navigation";
  import X from "@lucide/svelte/icons/x";

  type Tag = {
    id: string;
    name: string;
  };

  type Props = {
    tags: Tag[];
  };

  const { tags }: Props = $props();

  let newTagName = $state("");
  let isCreating = $state(false);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error("タグ名を入力してください");
      return;
    }

    isCreating = true;
    const response = await fetch("/api/tag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTagName.trim() }),
    });

    if (response.ok) {
      toast.success("タグを作成しました");
      newTagName = "";
      await invalidateAll();
    } else {
      toast.error("タグの作成に失敗しました");
    }
    isCreating = false;
  };

  const handleDeleteTag = async (tagId: string) => {
    const response = await fetch(`/api/tag/${tagId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      toast.success("タグを削除しました");
      await invalidateAll();
    } else {
      toast.error("タグの削除に失敗しました");
    }
  };
</script>

<div class="space-y-4">
  <h3 class="text-sm font-semibold">タグ</h3>

  <div class="flex gap-2">
    <input
      bind:value={newTagName}
      class="border-input bg-background flex-1 rounded-md border px-3 py-1.5 text-sm"
      placeholder="新しいタグ名"
    />
    <Button size="sm" onclick={handleCreateTag} disabled={isCreating}>
      追加
    </Button>
  </div>

  <div class="flex flex-wrap gap-2">
    {#each tags as tag (tag.id)}
      <span
        class="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs"
      >
        {tag.name}
        <button
          onclick={() => handleDeleteTag(tag.id)}
          class="hover:text-destructive rounded-full transition-colors"
        >
          <X class="h-3 w-3" />
        </button>
      </span>
    {/each}
  </div>
</div>
