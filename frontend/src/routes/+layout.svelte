<script lang="ts">
  import "$lib/app.css";
  import { ModeWatcher } from "mode-watcher";
  import { Toaster } from "svelte-sonner";
  import { page } from "$app/state";
  import { Header } from "$lib/components/layout";

  const { children, data } = $props();

  const isLoginPage = $derived(page.url.pathname === "/login");
  const userName = $derived(data.session?.user?.name ?? "");
  const userRole = $derived(data.session?.user?.role ?? "user");
</script>

<ModeWatcher />
<Toaster />

{#if isLoginPage}
  {@render children()}
{:else}
  <div class="min-h-screen">
    <Header {userName} {userRole} />
    <main class="p-4">
      {@render children()}
    </main>
  </div>
{/if}
