<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";
  import { invalidateAll } from "$app/navigation";
  import type { UserResponse } from "$lib/api/types";

  const { data }: { data: { users: UserResponse[] } } = $props();

  const handleRoleChange = async (userId: string, newRole: string) => {
    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });

    if (response.ok) {
      toast.success("ロールを変更しました");
      await invalidateAll();
    } else {
      toast.error("ロールの変更に失敗しました");
    }
  };
</script>

<div class="mx-auto max-w-3xl">
  <h2 class="mb-6 text-xl font-bold">ユーザー管理</h2>

  <div class="border-border overflow-hidden rounded-lg border">
    <table class="w-full text-sm">
      <thead class="bg-muted">
        <tr>
          <th class="px-4 py-3 text-left font-medium">名前</th>
          <th class="px-4 py-3 text-left font-medium">メール</th>
          <th class="px-4 py-3 text-left font-medium">ロール</th>
          <th class="px-4 py-3 text-left font-medium">操作</th>
        </tr>
      </thead>
      <tbody>
        {#each data.users as user (user.id)}
          <tr class="border-border border-t">
            <td class="px-4 py-3">{user.name}</td>
            <td class="px-4 py-3">{user.email}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex rounded-full px-2 py-1 text-xs font-medium {user.role ===
                'admin'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'}"
              >
                {user.role}
              </span>
            </td>
            <td class="px-4 py-3">
              {#if user.role === "admin"}
                <Button
                  variant="ghost"
                  size="sm"
                  onclick={() => handleRoleChange(user.id, "user")}
                >
                  user に変更
                </Button>
              {:else}
                <Button
                  variant="ghost"
                  size="sm"
                  onclick={() => handleRoleChange(user.id, "admin")}
                >
                  admin に変更
                </Button>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
