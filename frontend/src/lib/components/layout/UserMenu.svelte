<script lang="ts">
  import { authClient } from "$lib/api/auth-client";
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import User from "@lucide/svelte/icons/user";
  import LogOut from "@lucide/svelte/icons/log-out";
  import Shield from "@lucide/svelte/icons/shield";

  type Props = {
    userName: string;
    userRole: string;
  };

  const { userName, userRole }: Props = $props();

  const handleSignOut = async () => {
    await authClient.signOut();
    goto("/login");
  };
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button variant="ghost" size="icon" {...props}>
        <User class="h-5 w-5" />
        <span class="sr-only">ユーザーメニュー</span>
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    <DropdownMenu.Label>{userName}</DropdownMenu.Label>
    <DropdownMenu.Separator />
    {#if userRole === "admin"}
      <DropdownMenu.Item onclick={() => goto("/admin")}>
        <Shield class="mr-2 h-4 w-4" />
        ユーザー管理
      </DropdownMenu.Item>
    {/if}
    <DropdownMenu.Item onclick={handleSignOut}>
      <LogOut class="mr-2 h-4 w-4" />
      ログアウト
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
