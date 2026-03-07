# Garden アーキテクチャ

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| バックエンド | Hono (Cloudflare Workers) |
| フロントエンド | React Router + shadcn/ui |
| データベース | Cloudflare D1 (SQLite) |
| ORM | Drizzle ORM + drizzle-zod |
| 認証 | Better Auth |
| エラー追跡・監視 | Sentry |
| デプロイ | Cloudflare |

## ディレクトリ構成

```
garden/
├── frontend/          # React Router (FSD)
├── backend/           # Hono + tRPC on Cloudflare Workers (FC/IS)
├── packages/          # 共有パッケージ (モデル・DTO・バリデーション)
├── infra/             # Terraform (Cloudflare + GitHub)
├── .github/workflows/ # CI/CD (GitHub Actions)
└── docs/
```

---

## packages/ — 共有定義

```
packages/
├── schema/            # Drizzleテーブル定義 + drizzle-zodスキーマ + コンパニオン (Source of Truth)
├── dto/               # スキーマから派生するDTO定義
├── validation/        # バリデーションルール (refine, superRefine)
└── mock/              # Zodスキーマからモックデータ生成 (zod-schema-faker)
```

- **Drizzleテーブル定義 + drizzle-zodが唯一の型定義元 (Single Source of Truth)**
- 型のコンパニオンパターン（`Node.isRoot()` 等）も `schema/` に同居させる
- DTOはZodスキーマを `.pick()`, `.omit()`, `.extend()` 等で加工して生成
- `refine` / `superRefine` によるビジネスバリデーションは `validation/` で一元管理
- モックデータは `zod-schema-faker` でZodスキーマから自動生成 (seed対応で再現性あり)

依存方向: `validation → dto → schema`、`mock → schema`

---

## バックエンド — Hono + tRPC, Functional Core / Imperative Shell

```
backend/
├── router/          # Shell: tRPC ルーター定義、プロシージャ → usecase 呼び出し
├── usecases/        # Core: ビジネスロジック (純粋、Result型を返す)
├── domain/          # Core: backend固有のドメインロジック (必要な場合のみ)
├── adapters/        # Shell: リポジトリ実装、D1、外部API
├── middleware/       # Shell: Hono ミドルウェア (CORS等)、tRPC ミドルウェア (認証等)
└── app.ts           # Shell: Hono アプリ、tRPC マウント (/trpc/*)、非RPCルート (/auth/* 等)
```

依存方向: `router → usecases → domain ← adapters`、`middleware → domain`

### エラーハンドリング — neverthrow

- `try-catch` はアプリケーションのルート (エントリポイント) でのみ使用
- それ以外では `neverthrow` の `Result` 型で `ResultAsync.fromPromise` → `.andThen` → `.match`
- エラー型 `AppError` をコンパニオンパターンで定義 (`AppError.notFound()` 等)

### キャッシュ

Cloudflare Cache API でD1クエリ結果をエッジキャッシュ (無料、TTL は Cache-Control で制御)。

---

## フロントエンド — Feature-Sliced Design (FSD)

```
frontend/
├── app/               # アプリ初期化、プロバイダー、ルーティング
├── pages/             # ページコンポーネント (ルート単位)
├── widgets/           # 独立したUI複合体 (ヘッダー、サイドバー等)
├── features/          # ユーザーインタラクション (CRUD操作等)
├── entities/          # ビジネスエンティティ (Node, Tag, User)
└── shared/            # 共通ユーティリティ、UI部品、型定義
```

依存方向: `app → pages → widgets → features → entities → shared`

- 上位レイヤーは下位レイヤーにのみ依存可能 (逆方向・同レイヤー間の依存禁止)
- 各スライスは `index.ts` で公開APIを定義

### 状態管理

React Router の loader/action + URL params + cookies を優先。Zustand はクライアントのみの高頻度更新状態 (グラフ操作等) に限定。

### UIコンポーネント

shadcn/ui を使用。`shared/ui/` に配置。

### フォーム

React Hook Form + `@hookform/resolvers/zod` で packages/dto/ の Zod スキーマをバリデーションに使用。

### グラフ描画

React Flow。

### 通知

Sonner (toast) で操作結果をフィードバック。

### キャッシュ・楽観的更新

tRPC (TanStack Query) のクエリキャッシュ + 楽観的更新 (`onMutate` で即時反映、`onError` でロールバック + toast)。
