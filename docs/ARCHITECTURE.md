# Garden アーキテクチャ

## バックエンド — Functional Core / Imperative Shell

- Core (usecases, domain) は純粋関数で、`neverthrow` の `Result` 型を返す
- Shell (router, adapters, middleware) は副作用を扱う
- 単純な CRUD は router から直接 Drizzle を使ってよい。usecase 層を経由するのはビジネスロジックがある場合のみ

依存方向: `router → usecases → domain ← adapters`、`middleware → domain`

### エラーハンドリング — neverthrow

- `try-catch` はアプリケーションのルート (エントリポイント) でのみ使用
- それ以外では `ResultAsync.fromPromise` → `.andThen` → `.match`
- エラー型 `AppError` をコンパニオンパターンで定義 (`AppError.notFound()` 等)

### キャッシュ

Cloudflare Cache API でD1クエリ結果をエッジキャッシュ (TTL は Cache-Control で制御)。

---

## フロントエンド — Feature-Sliced Design

依存方向: `app → pages → widgets → features → entities → shared`

- 上位レイヤーは下位レイヤーにのみ依存可能 (逆方向・同レイヤー間の依存禁止)
- 各スライスは `index.ts` で公開APIを定義

### 状態管理の使い分け

| 状態の種類 | 管理方法 |
|-----------|---------|
| サーバーデータ | tRPC (TanStack Query) |
| URL で表現できる状態 (フィルタ、ソート等) | URL params |
| ユーザー設定 | cookies |
| グラフ操作 (ズーム/パン/ドラッグ) | Zustand |

### 楽観的更新

mutation 時は `onMutate` でキャッシュを即時反映、`onError` でロールバック + Sonner toast でエラー通知。

### フォーム

React Hook Form + `@hookform/resolvers/zod` で `packages/dto/` の Zod スキーマをバリデーションに使用。

---

## packages/ — 共有定義の設計思想

- **Drizzle テーブル定義 + drizzle-zod が唯一の型定義元 (Single Source of Truth)**
- 型のコンパニオンパターン（`Node.isRoot()` 等）も `schema/` に同居させる
- DTO は Zod スキーマを `.pick()`, `.omit()`, `.extend()` 等で加工して生成
- `refine` / `superRefine` によるビジネスバリデーションは `validation/` で一元管理
- モックデータは `zod-schema-faker` で Zod スキーマから自動生成 (seed 対応で再現性あり)

依存方向: `validation → dto → schema`、`mock → schema`
