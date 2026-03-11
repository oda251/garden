<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import type { NodeResponse } from "$lib/api/types";

  type Props = {
    node: NodeResponse;
    onClose: () => void;
  };

  const { node, onClose }: Props = $props();

  let isDeleting = $state(false);

  const handleDelete = async () => {
    isDeleting = true;
    const response = await fetch(`/api/node/${node.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      toast.success("ノードを削除しました");
      await goto("/graph");
    } else {
      toast.error("ノードの削除に失敗しました");
    }
    isDeleting = false;
  };
</script>

<div
  class="bg-background/80 fixed inset-0 z-50 flex items-center justify-center"
  role="alertdialog"
>
  <div
    class="border-border bg-background w-full max-w-sm rounded-lg border p-6 shadow-lg"
  >
    <h2 class="mb-2 text-lg font-semibold">ノードの削除</h2>

    <p class="text-muted-foreground mb-4 text-sm">
      「{node.title}」を削除します。子ノードも全て削除されます。この操作は取り消せません。
    </p>

    <div class="flex justify-end gap-2">
      <Button variant="ghost" onclick={onClose}>キャンセル</Button>
      <Button
        variant="destructive"
        onclick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? "削除中..." : "削除"}
      </Button>
    </div>
  </div>
</div>
