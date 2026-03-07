# Garden コーディング規約

## アーキテクチャ

### ディレクトリ構成

```
garden/
├── frontend/          # React Router (FSD)
├── backend/           # Hono + tRPC on Cloudflare Workers (FC/IS)
├── packages/          # 共有パッケージ (モデル・DTO・バリデーション)
├── infra/             # Terraform (Cloudflare + GitHub)
├── .github/workflows/ # CI/CD (GitHub Actions)
└── docs/
```

### packages/ — 共有定義

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
- フロントエンド・バックエンド両方からこのパッケージを参照する

依存方向: `validation → dto → schema`、`mock → schema`

```typescript
// packages/schema/node.ts
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

export const nodes = sqliteTable("nodes", {
  id: text("id").primaryKey(),
  parentId: text("parent_id").references(() => nodes.id),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const NodeSchema = createSelectSchema(nodes, {
  id: (schema) => schema.ulid(),
  title: (schema) => schema.min(1).max(200),
  createdAt: (schema) => schema.datetime(),
  updatedAt: (schema) => schema.datetime(),
});
export type Node = typeof NodeSchema._type;

export const InsertNodeSchema = createInsertSchema(nodes, {
  title: (schema) => schema.min(1).max(200),
});
export type InsertNode = typeof InsertNodeSchema._type;

// コンパニオンパターン: 型と同名のオブジェクトでドメインロジックを提供
export const Node = {
  isRoot: (node: Node): boolean => node.parentId === null,
  getDepth: (node: Node, allNodes: Node[]): number => { ... },
};
```

```typescript
// packages/dto/node.ts
import { InsertNodeSchema } from "../schema/node";

export const CreateNodeDtoSchema = InsertNodeSchema.pick({
  title: true,
  content: true,
  parentId: true,
});
export type CreateNodeDto = typeof CreateNodeDtoSchema._type;
```

```typescript
// packages/validation/node.ts
import { CreateNodeDtoSchema } from "../dto/node";

export const CreateNodeDtoValidatedSchema = CreateNodeDtoSchema.superRefine(
  (data, ctx) => {
    // カスタムバリデーション
  },
);
```

---

## インポート順序

```typescript
// 1. 外部ライブラリ
import { z } from "zod";
import { ok, err } from "neverthrow";

// 2. packages/ (共有パッケージ)
import { NodeSchema } from "@garden/schema";
import { CreateNodeDtoSchema } from "@garden/dto";

// 3. 同一プロジェクト内の上位レイヤー → 下位レイヤー
import { useNodes } from "~/entities/node";
import { Button } from "~/shared/ui";

// 4. 同一ディレクトリ
import { helper } from "./utils";
```

---

## その他の方針

- **`interface` より `type` を優先**: `interface` は declaration merging が必要な場合のみ
- **`enum` 禁止**: `as const` オブジェクト + 型推論で代替
- **`strict: true`**: TypeScriptの全strictオプション有効
- **barrel exports**: 各スライス/モジュールは `index.ts` でPublic APIを公開
- **パッケージマネージャ**: bun
- **ライブラリは最新版を使用**: インストール時は常に最新の安定版を指定する

---

## バックエンド規約

### Hono + tRPC, Functional Core, Imperative Shell

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

### neverthrow によるエラーハンドリング

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

### キャッシュ

Cloudflare Cache API でD1クエリ結果をエッジキャッシュ (無料、TTL は Cache-Control で制御)。

---

## フロントエンド規約

### Feature-Sliced Design (FSD)

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

- 上位レイヤーは下位レイヤーにのみ依存可能 (逆方向の依存禁止)
- 同一レイヤー内のスライス間は直接参照禁止
- 各スライスは `index.ts` で公開APIを定義 (Public API パターン)

### 状態管理

React Router の loader/action + URL params + cookies を優先。クライアントのみの高頻度更新状態 (グラフ操作等) は Zustand を最小限で使用。

### UIコンポーネント

shadcn/ui を使用。`shared/ui/` に配置する。shadcn/ui のコンポーネントをそのまま使い、プロジェクト固有のラッパーが必要な場合のみ `shared/ui/` に追加コンポーネントを作る。

### フォーム

React Hook Form + `@hookform/resolvers/zod` で packages/dto/ の Zod スキーマをバリデーションに使用。

### グラフ描画

React Flow (ノード操作・ズーム/パン/ドラッグ組み込み)。

### 通知

Sonner (toast) で操作結果をフィードバックする。楽観的更新の成功・失敗・ロールバックの通知に使用。

### キャッシュ・楽観的更新

tRPC (TanStack Query) のクエリキャッシュで不要なリクエストを抑制。mutation 時は楽観的更新 (`onMutate` でキャッシュを即時反映、`onError` でロールバック + toast でエラー通知) を行い、ユーザー体験を優先する。

---

## レビューチェックリスト

以下の項目を順にチェックする。変更対象の領域に該当する項目のみチェックすればよい。

### 共通

#### 1. クラス禁止

ライブラリ境界 (Better Auth設定、Hono拡張等) を除き、クラスの使用を禁止する。

```typescript
// BAD
class NodeService {
  constructor(private repo: NodeRepository) {}
  async getById(id: string) { ... }
}

// GOOD: コンパニオンパターン
export type NodeService = {
  getById: (id: string) => ResultAsync<Node, AppError>;
};

export const NodeService = {
  create: (repo: NodeRepository): NodeService => ({
    getById: (id) => repo.findById(id),
  }),
};
```

#### 2. 型アサーション禁止

ライブラリ境界を除き、`as` による型アサーションを禁止する。`as const` は許可。

```typescript
// BAD
const user = data as User;

// GOOD
const parsed = UserSchema.safeParse(data);
if (parsed.success) {
  const user = parsed.data;
}
```

#### 3. コンパニオンパターンの適用

型と同名のオブジェクトを定義し、名前空間的に使用する。packages/schema/ に型と同居させる。

#### 4. 命名規則の遵守

| 対象 | スタイル | 例 |
|------|----------|-----|
| ファイル名 | kebab-case | `node-service.ts` |
| 型 | PascalCase | `NodeService`, `CreateNodeDto` |
| 関数 / 変数 | camelCase | `findNode`, `nodeCount` |
| 定数 | UPPER_SNAKE_CASE | `MAX_DEPTH` |
| Zodスキーマ | PascalCase + `Schema` | `NodeSchema` |
| React コンポーネント | PascalCase | `GraphView` |
| React hooks | `use` プレフィックス | `useNodes` |
| イベントハンドラー | `handle` プレフィックス | `handleNodeClick` |
| boolean変数 | `is` / `has` / `can` プレフィックス | `isRoot` |

### バックエンド

#### 5. neverthrow / try-catch

- `try-catch` はアプリケーションのルート (エントリポイント) でのみ使用
- それ以外では `ResultAsync.fromPromise` → `.andThen` → `.match` パターン

### フロントエンド

#### 6. Zustand の最小限使用

Zustand はクライアントのみの高頻度更新状態 (グラフのズーム/パン/ドラッグ等) に限定する。以下は React Router の loader/action + URL params + cookies で管理すること:
- サーバーから取得したデータ
- URLで表現できる状態 (フィルタ、ソート、ページネーション等)
- ユーザー設定 (cookies)
