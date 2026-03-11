<script lang="ts">
  import { renderMarkdown } from "$lib/markdown";
  import { Button } from "$lib/components/ui/button";
  import { NodeEditForm, NodeDeleteDialog } from "$lib/components/node";
  import Pencil from "@lucide/svelte/icons/pencil";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import type { NodeResponse } from "$lib/api/types";

  type PageData = {
    node: NodeResponse;
    children: NodeResponse[];
    session: { user: { id: string; role: string } } | null;
  };

  const { data }: { data: PageData } = $props();

  let renderedContent = $state("");
  let isEditing = $state(false);
  let isDeleteConfirming = $state(false);

  const updateRenderedContent = async () => {
    renderedContent = await renderMarkdown(data.node.content || "");
  };

  $effect(() => {
    void updateRenderedContent();
  });

  const canEdit = $derived(
    data.session?.user?.role === "admin" ||
      data.session?.user?.id === data.node.createdBy,
  );

  const canDelete = $derived(
    data.session?.user?.role === "admin" ||
      data.session?.user?.id === data.node.createdBy,
  );
</script>

<div class="mx-auto max-w-3xl">
  <article class="space-y-6">
    <header class="flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold">{data.node.title}</h1>
        <p class="text-muted-foreground mt-2 text-sm">
          作成: {new Date(data.node.createdAt).toLocaleDateString("ja-JP")}
          | 更新: {new Date(data.node.updatedAt).toLocaleDateString("ja-JP")}
        </p>
      </div>

      {#if canEdit || canDelete}
        <div class="flex gap-1">
          {#if canEdit}
            <Button
              variant="ghost"
              size="icon"
              onclick={() => (isEditing = true)}
            >
              <Pencil class="h-4 w-4" />
              <span class="sr-only">編集</span>
            </Button>
          {/if}
          {#if canDelete}
            <Button
              variant="ghost"
              size="icon"
              onclick={() => (isDeleteConfirming = true)}
            >
              <Trash2 class="h-4 w-4" />
              <span class="sr-only">削除</span>
            </Button>
          {/if}
        </div>
      {/if}
    </header>

    {#if data.children.length > 0}
      <nav class="border-border rounded-lg border p-4">
        <h2 class="mb-2 text-sm font-semibold">子ノード</h2>
        <ul class="space-y-1">
          {#each data.children as child (child.id)}
            <li>
              <a
                href="/article/{child.id}"
                class="text-primary text-sm hover:underline"
              >
                {child.title}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    {/if}

    <div class="prose dark:prose-invert max-w-none">
      {@html renderedContent}
    </div>
  </article>
</div>

{#if isEditing}
  <NodeEditForm node={data.node} onClose={() => (isEditing = false)} />
{/if}

{#if isDeleteConfirming}
  <NodeDeleteDialog
    node={data.node}
    onClose={() => (isDeleteConfirming = false)}
  />
{/if}
