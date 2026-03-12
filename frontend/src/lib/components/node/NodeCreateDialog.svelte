<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";
  import { invalidateAll } from "$app/navigation";

  type Props = {
    parentId?: string | null;
  };

  const { parentId = null }: Props = $props();

  let isOpen = $state(false);
  let title = $state("");
  let content = $state("");
  let isSubmitting = $state(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }

    isSubmitting = true;
    const response = await fetch("/api/node", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, parentId }),
    });

    if (response.ok) {
      toast.success("ノードを作成しました");
      title = "";
      content = "";
      isOpen = false;
      await invalidateAll();
    } else {
      toast.error("ノードの作成に失敗しました");
    }
    isSubmitting = false;
  };

  const handleToggle = () => {
    isOpen = !isOpen;
  };
</script>

<Button variant="outline" size="sm" onclick={handleToggle}>+ ノード作成</Button>

{#if isOpen}
  <div
    class="bg-background/80 fixed inset-0 z-50 flex items-center justify-center"
  >
    <div
      class="border-border bg-background w-full max-w-md rounded-lg border p-6 shadow-lg"
    >
      <h2 class="mb-4 text-lg font-semibold">ノード作成</h2>

      <div class="space-y-4">
        <div>
          <label for="node-title" class="mb-1 block text-sm font-medium"
            >タイトル</label
          >
          <input
            id="node-title"
            bind:value={title}
            class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
            placeholder="タイトルを入力"
          />
        </div>

        <div>
          <label for="node-content" class="mb-1 block text-sm font-medium"
            >コンテンツ (Markdown)</label
          >
          <textarea
            id="node-content"
            bind:value={content}
            rows={6}
            class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Markdown で入力"
          ></textarea>
        </div>

        <div class="flex justify-end gap-2">
          <Button variant="ghost" onclick={handleToggle}>キャンセル</Button>
          <Button onclick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "作成中..." : "作成"}
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}
