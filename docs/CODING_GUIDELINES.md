# Garden コーディング規約

## アーキテクチャ

### ディレクトリ構成

```
garden/
├── frontend/          # React Router (FSD)
├── backend/           # Hono on Cloudflare Workers (Functional Core, Imperative Shell)
├── packages/          # 共有パッケージ (モデル・DTO・バリデーション)
└── docs/
```

### フロントエンド — Feature-Sliced Design (FSD)

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

### バックエンド — Functional Core, Imperative Shell

```
backend/
├── routes/          # Shell: Hono ルートハンドラー、DI組み立て
├── usecases/        # Core: ビジネスロジック (純粋、Result型を返す)
├── domain/          # Core: backend固有のドメインロジック (必要な場合のみ)
├── adapters/        # Shell: リポジトリ実装、D1、外部API
└── middleware/       # Shell: 認証、エラーハンドリング
```

依存方向: `routes → usecases → domain ← adapters`、`middleware → domain`

### packages/ — 共有定義

```
packages/
├── schema/            # Drizzleテーブル定義 + drizzle-zodスキーマ + コンパニオン (Source of Truth)
├── dto/               # スキーマから派生するDTO定義
└── validation/        # バリデーションルール (refine, superRefine)
```

- **Drizzleテーブル定義 + drizzle-zodが唯一の型定義元 (Single Source of Truth)**
- 型のコンパニオンパターン（`Node.isRoot()` 等）も `schema/` に同居させる
- DTOはZodスキーマを `.pick()`, `.omit()`, `.extend()` 等で加工して生成
- `refine` / `superRefine` によるビジネスバリデーションは `validation/` で一元管理
- フロントエンド・バックエンド両方からこのパッケージを参照する

依存方向: `validation → dto → schema`

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

## コーディングルール

### クラス禁止

ライブラリ境界 (Better Auth設定、Hono拡張等) を除き、**クラスの使用を禁止**する。

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

### コンパニオンパターン

型と同名のオブジェクトを定義し、名前空間的に使用する。packages/schema/ に型と同居させる。

```typescript
// packages/schema/node.ts
export type Node = typeof NodeSchema._type;

export const Node = {
  isRoot: (node: Node): boolean => node.parentId === null,
  getDepth: (node: Node, allNodes: Node[]): number => { ... },
};
```

### 型アサーション禁止

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

---

## ツールチェイン

### Linter — oxlint (type-aware)

```jsonc
// .oxlintrc.json
{
  "plugins": ["typescript", "import", "promise"],
  "categories": {
    "correctness": "error",
    "suspicious": "warn",
    "pedantic": "warn"
  },
  "rules": {
    "typescript/no-unsafe-type-assertion": "error",
    "typescript/no-non-null-assertion": "error",
    "typescript/no-unnecessary-type-assertion": "error",
    "typescript/no-extraneous-class": "error",
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
    "typescript/await-thenable": "error",
    "import/no-cycle": "error",
    "import/no-self-import": "error",
    "no-var": "error",
    "prefer-const": "error",
    "no-console": "warn",
    "eqeqeq": "error"
  }
}
```

oxlint未対応のルール (`no-restricted-syntax` 非対応):

| ルール | 対応策 |
|--------|--------|
| クラス宣言の完全禁止 | `no-extraneous-class` で部分カバー + レビュー |
| `try-catch` のルート以外での使用禁止 | レビュー |

### 依存方向の強制 — dependency-cruiser

バックエンド・フロントエンド両方のレイヤー間依存ルールを静的に検証する。

```bash
bunx depcruise --config .dependency-cruiser.cjs backend/ frontend/
```

- `--cache` でキャッシュ有効化 (2回目以降高速)
- `tsPreCompilationDeps: true` でTS直接解析
- CI または pre-commit で実行

### Formatter — oxfmt

```jsonc
// .oxfmtrc.json
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "bracketSpacing": true
}
```

### Pre-commit フック — lefthook

```yaml
# lefthook.yml
pre-commit:
  commands:
    format:
      glob: "*.{ts,tsx,js,jsx,json}"
      run: oxfmt --write {staged_files}
    lint:
      glob: "*.{ts,tsx,js,jsx}"
      run: oxlint --typecheck {staged_files}
```

### 実装完了時チェック

プロジェクト全体を走査するため、pre-commitではなく実装完了時に実行する。

```bash
bunx knip --no-progress
similarity-ts . --threshold 0.8
```

---

## 命名規則

| 対象 | スタイル | 例 |
|------|----------|-----|
| ファイル名 | kebab-case | `node-service.ts` |
| 型 | PascalCase | `NodeService`, `CreateNodeDto` |
| 関数 / 変数 | camelCase | `findNode`, `nodeCount` |
| 定数 | UPPER_SNAKE_CASE | `MAX_DEPTH`, `DEFAULT_PAGE_SIZE` |
| Zodスキーマ | PascalCase + `Schema` | `NodeSchema`, `CreateNodeDtoSchema` |
| React コンポーネント | PascalCase | `GraphView`, `NodeCard` |
| React hooks | `use` プレフィックス | `useNodes`, `useGraphLayout` |
| イベントハンドラー | `handle` プレフィックス | `handleNodeClick` |
| boolean変数 | `is` / `has` / `can` プレフィックス | `isRoot`, `hasChildren` |

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
