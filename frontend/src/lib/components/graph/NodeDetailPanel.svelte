<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { NodeEditForm, NodeDeleteDialog } from "$lib/components/node";
  import { NodeTagManager } from "$lib/components/tag";
  import { renderMarkdown } from "$lib/markdown";
  import Pencil from "@lucide/svelte/icons/pencil";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import FileText from "@lucide/svelte/icons/file-text";
  import XIcon from "@lucide/svelte/icons/x";
  import type { NodeResponse, TagResponse } from "$lib/api/types";

  type Props = {
    node: NodeResponse;
    assignedTags: TagResponse[];
    allTags: TagResponse[];
    canEdit: boolean;
    onClose: () => void;
  };

  const { node, assignedTags, allTags, canEdit, onClose }: Props = $props();

  let isEditing = $state(false);
  let isDeleteConfirming = $state(false);
  let renderedPreview = $state("");

  const updatePreview = async () => {
    const preview =
      node.content.length > 200
        ? node.content.slice(0, 200) + "..."
        : node.content;
    renderedPreview = await renderMarkdown(preview || "");
  };

  $effect(() => {
    void updatePreview();
  });
</script>

<aside
  class="border-border bg-background flex h-full w-80 flex-col overflow-y-auto border-l p-4"
>
  <div class="mb-4 flex items-center justify-between">
    <h3 class="truncate text-lg font-semibold">{node.title}</h3>
    <Button variant="ghost" size="icon" onclick={onClose}>
      <XIcon class="h-4 w-4" />
    </Button>
  </div>

  <div class="text-muted-foreground mb-4 text-xs">
    <p>
      作成: {new Date(node.createdAt).toLocaleDateString("ja-JP")}
    </p>
    <p>
      更新: {new Date(node.updatedAt).toLocaleDateString("ja-JP")}
    </p>
  </div>

  <div class="mb-4">
    <NodeTagManager nodeId={node.id} {assignedTags} {allTags} />
  </div>

  {#if node.content}
    <div class="prose dark:prose-invert mb-4 max-w-none text-sm">
      {@html renderedPreview}
    </div>
  {:else}
    <p class="text-muted-foreground mb-4 text-sm">(内容なし)</p>
  {/if}

  <div class="mt-auto flex gap-2">
    <Button variant="outline" size="sm" href="/article/{node.id}">
      <FileText class="mr-1.5 h-4 w-4" />
      記事を表示
    </Button>
    {#if canEdit}
      <Button variant="outline" size="sm" onclick={() => (isEditing = true)}>
        <Pencil class="mr-1.5 h-4 w-4" />
        編集
      </Button>
      <Button
        variant="outline"
        size="sm"
        onclick={() => (isDeleteConfirming = true)}
      >
        <Trash2 class="mr-1.5 h-4 w-4" />
        削除
      </Button>
    {/if}
  </div>
</aside>

{#if isEditing}
  <NodeEditForm {node} onClose={() => (isEditing = false)} />
{/if}

{#if isDeleteConfirming}
  <NodeDeleteDialog {node} onClose={() => (isDeleteConfirming = false)} />
{/if}
