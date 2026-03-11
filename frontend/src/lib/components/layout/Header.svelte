<script lang="ts">
  import { page } from "$app/state";
  import ThemeToggle from "./ThemeToggle.svelte";
  import UserMenu from "./UserMenu.svelte";
  import { Separator } from "$lib/components/ui/separator";

  type Props = {
    userName: string;
    userRole: string;
  };

  const { userName, userRole }: Props = $props();

  const navItems = [
    { href: "/graph", label: "グラフ" },
    { href: "/timeline", label: "タイムライン" },
  ] as const;
</script>

<header class="border-border bg-background sticky top-0 z-50 border-b">
  <div class="flex h-14 items-center px-4">
    <a href="/" class="mr-6 text-lg font-bold">Garden</a>

    <nav class="flex items-center gap-1">
      {#each navItems as item}
        <a
          href={item.href}
          class="rounded-md px-3 py-2 text-sm font-medium transition-colors {page
            .url.pathname === item.href
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
        >
          {item.label}
        </a>
      {/each}
    </nav>

    <div class="ml-auto flex items-center gap-2">
      <ThemeToggle />
      <Separator orientation="vertical" class="h-6" />
      <UserMenu {userName} {userRole} />
    </div>
  </div>
</header>
