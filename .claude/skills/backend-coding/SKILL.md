---
name: backend-coding
description: Backend coding guidelines - Hono + tRPC, FC/IS architecture, neverthrow, caching
---

# バックエンド コーディング規約

## Hono + tRPC, Functional Core, Imperative Shell

```
backend/
├── router/          # Shell: tRPC ルーター定義、プロシージャ → usecase 呼び出し
├── usecases/        # Core: ビジネスロジック (純粋、Result型を返す)
├── domain/          # Core: backend固有のドメインロジック (必要な場合のみ)
├── adapters/        # Shell: リポジトリ実装、D1、外部API
├── middleware/       # Shell: Hono ミドルウェア (CORS等)、tRPC ミドルウェア (認証等)
└── app.ts           # Shell: Hono アプリ、tRPC マウント (/trpc/*)、非RPCルート (/auth/* 等)
```

- Hono: HTTP層 (ミドルウェア、認証コールバック、webhook 等の非RPCエンドポイント)
- tRPC: API層 (`/trpc/*` にマウント、クライアントから型安全に呼び出し)

依存方向: `router → usecases → domain ← adapters`、`middleware → domain`

## neverthrow によるエラーハンドリング

`try-catch` はアプリケーションのルート (エントリポイント) でのみ使用する。それ以外では `neverthrow` の `Result` 型を使う。

```typescript
import { ok, err, ResultAsync } from "neverthrow";

export type AppError = {
  code: string;
  message: string;
  statusCode: number;
};

export const AppError = {
  notFound: (msg: string): AppError => ({ code: "NOT_FOUND", message: msg, statusCode: 404 }),
  forbidden: (msg: string): AppError => ({ code: "FORBIDDEN", message: msg, statusCode: 403 }),
};

const findNode = (id: string): ResultAsync<Node, AppError> =>
  ResultAsync.fromPromise(
    repo.findById(id),
    () => AppError.notFound(`Node ${id} not found`),
  );

const result = await findNode(id)
  .andThen(validatePermission)
  .andThen(updateNode)
  .match(
    (node) => c.json(node, 200),
    (error) => c.json({ error: error.message }, error.statusCode),
  );
```

## キャッシュ

Cloudflare Cache API でD1クエリ結果をエッジキャッシュ (無料、TTL は Cache-Control で制御)。
