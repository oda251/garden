<script lang="ts">
  import { authClient } from "$lib/api/auth-client";

  const handleGoogleLogin = () => {
    authClient.signIn.social({ provider: "google", callbackURL: "/" });
  };

  const handleGithubLogin = () => {
    authClient.signIn.social({ provider: "github", callbackURL: "/" });
  };
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="border-border w-full max-w-sm space-y-6 rounded-lg border p-8">
    <div class="text-center">
      <h1 class="text-2xl font-bold">Garden</h1>
      <p class="text-muted-foreground mt-2 text-sm">
        アカウントにログインしてください
      </p>
    </div>

    <div class="space-y-3">
      <button
        onclick={handleGoogleLogin}
        class="border-input bg-background hover:bg-accent flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium"
      >
        Google でログイン
      </button>

      <button
        onclick={handleGithubLogin}
        class="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
      >
        GitHub でログイン
      </button>
    </div>
  </div>
</div>
