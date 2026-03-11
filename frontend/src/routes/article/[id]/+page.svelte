<script lang="ts">
  import { renderMarkdown } from "$lib/markdown";
  import type { NodeResponse } from "$lib/api/types";

  const { data }: { data: { node: NodeResponse; children: NodeResponse[] } } =
    $props();

  let renderedContent = $state("");

  $effect(() => {
    renderMarkdown(data.node.content || "").then((html) => {
      renderedContent = html;
    });
  });
</script>

<div class="mx-auto max-w-3xl">
  <article class="space-y-6">
    <header>
      <h1 class="text-3xl font-bold">{data.node.title}</h1>
      <p class="text-muted-foreground mt-2 text-sm">
        作成: {new Date(data.node.createdAt).toLocaleDateString("ja-JP")}
        | 更新: {new Date(data.node.updatedAt).toLocaleDateString("ja-JP")}
      </p>
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
