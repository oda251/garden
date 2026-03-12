<script lang="ts">
  import { toggleMode } from "mode-watcher";
  import Sun from "@lucide/svelte/icons/sun";
  import Moon from "@lucide/svelte/icons/moon";
  import { Button } from "$lib/components/ui/button";
</script>

<Button variant="ghost" size="icon" onclick={toggleMode}>
  <Sun
    class="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
  />
  <Moon
    class="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
  />
  <span class="sr-only">テーマ切替</span>
</Button>
