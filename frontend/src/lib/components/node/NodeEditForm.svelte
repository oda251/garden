<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";
  import { invalidateAll } from "$app/navigation";
  import type { NodeResponse } from "$lib/api/types";

  type Props = {
    node: NodeResponse;
    onClose: () => void;
  };

  const { node, onClose }: Props = $props();

  let title = $state(node.title);
  let content = $state(node.content);
  let isSubmitting = $state(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }

    isSubmitting = true;
    const response = await fetch(`/api/node/${node.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (response.ok) {
      toast.success("ノードを更新しました");
      await invalidateAll();
      onClose();
    } else {
      toast.error("ノードの更新に失敗しました");
    }
    isSubmitting = false;
  };
</script>

<div
  class="bg-background/80 fixed inset-0 z-50 flex items-center justify-center"
  role="dialog"
>
  <div
    class="border-border bg-background w-full max-w-md rounded-lg border p-6 shadow-lg"
  >
    <h2 class="mb-4 text-lg font-semibold">ノード編集</h2>

    <div class="space-y-4">
      <div>
        <label for="edit-node-title" class="mb-1 block text-sm font-medium">
          タイトル
        </label>
        <input
          id="edit-node-title"
          bind:value={title}
          class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
          placeholder="タイトルを入力"
        />
      </div>

      <div>
        <label for="edit-node-content" class="mb-1 block text-sm font-medium">
          コンテンツ (Markdown)
        </label>
        <textarea
          id="edit-node-content"
          bind:value={content}
          rows={8}
          class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Markdown で入力"
        ></textarea>
      </div>

      <div class="flex justify-end gap-2">
        <Button variant="ghost" onclick={onClose}>キャンセル</Button>
        <Button onclick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "更新中..." : "更新"}
        </Button>
      </div>
    </div>
  </div>
</div>
