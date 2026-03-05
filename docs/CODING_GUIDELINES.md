# Garden コーディング規約

## アーキテクチャ

### ディレクトリ構成

```
garden/
├── frontend/          # React Router (FSD)
├── backend/           # Hono on Cloudflare Workers (Clean Architecture)
├── packages/          # 共有パッケージ (モデル・DTO・バリデーション)
├── docs/
└── ...
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

各レイヤーの依存方向: `app → pages → widgets → features → entities → shared`

- 上位レイヤーは下位レイヤーにのみ依存可能 (逆方向の依存禁止)
- 同一レイヤー内のスライス間は直接参照禁止
- 各スライスは `index.ts` で公開APIを定義 (Public API パターン)

### バックエンド — Clean Architecture

```
backend/
├── presentation/      # Honoルートハンドラー、ミドルウェア
├── application/       # ユースケース、アプリケーションサービス
├── domain/            # ドメインモデル、ドメインサービス、リポジトリインターフェース
└── infrastructure/    # リポジトリ実装、外部API連携、D1アクセス
```

依存方向: `presentation → application → domain ← infrastructure`

- `domain` は他のどの層にも依存しない
- `infrastructure` は `domain` のインターフェースを実装する (依存性逆転)
- ユースケースは1クラス1責務 (ただし後述のコンパニオンパターンで定義)

### packages/ — 共有定義

```
packages/
├── schema/            # Drizzleテーブル定義 (Source of Truth)
├── models/            # drizzle-zodで生成したZodスキーマ + 型
├── dto/               # モデルから派生するDTO定義
└── validation/        # バリデーションルール (refine, superRefine)
```

- **Drizzleテーブル定義が唯一の型定義元 (Single Source of Truth)**
- `drizzle-zod` の `createSelectSchema` / `createInsertSchema` でZodスキーマを導出
- DTOはZodスキーマを `.pick()`, `.omit()`, `.extend()` 等で加工して生成
- `refine` / `superRefine` によるバリデーションルールもここで一元管理
- フロントエンド・バックエンド両方からこのパッケージを参照する

```typescript
// packages/schema/node.ts  — SoT (Drizzleテーブル定義)
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const nodes = sqliteTable("nodes", {
  id: text("id").primaryKey(),
  parentId: text("parent_id").references(() => nodes.id),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
```

```typescript
// packages/models/node.ts  — drizzle-zodでZodスキーマを導出
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { nodes } from "../schema/node";

// Selectスキーマ (DB→アプリ方向のバリデーション)
export const NodeSchema = createSelectSchema(nodes);
export type Node = typeof NodeSchema._type;

// Insertスキーマ (アプリ→DB方向のバリデーション)
export const InsertNodeSchema = createInsertSchema(nodes);
export type InsertNode = typeof InsertNodeSchema._type;
```

```typescript
// packages/dto/node.ts  — DTOはZodスキーマから派生
import { InsertNodeSchema } from "../models/node";

export const CreateNodeDto = InsertNodeSchema.pick({
  title: true,
  content: true,
  parentId: true,
});

export type CreateNodeDto = typeof CreateNodeDto._type;
```

```typescript
// packages/validation/node.ts  — refine/superRefine をここで登録
import { CreateNodeDto } from "../dto/node";

export const CreateNodeDtoValidated = CreateNodeDto.superRefine(
  (data, ctx) => {
    // カスタムバリデーション
  },
);
```

---

## コーディングルール

### クラス禁止

ライブラリ境界 (Better Auth設定、Hono拡張等) を除き、**クラスの使用を禁止**する。

- データ構造: Drizzleテーブル定義 → drizzle-zod → 型推論
- ロジックのまとまり: コンパニオンパターン (後述)
- 状態管理: React hooks / 関数ベースのストア

```typescript
// BAD
class NodeService {
  constructor(private repo: NodeRepository) {}
  async getById(id: string) { ... }
}

// GOOD: コンパニオンパターン
export type NodeService = {
  getById: (id: string) => Promise<Result<Node, AppError>>;
};

export const NodeService = {
  create: (repo: NodeRepository): NodeService => ({
    getById: (id) => repo.findById(id),
  }),
};
```

### コンパニオンパターン

型と同名のオブジェクトを定義し、名前空間的に使用する。

```typescript
// 型とファクトリを同名でエクスポート
export type Node = z.infer<typeof NodeSchema>;

export const Node = {
  create: (params: CreateNodeDto): Node => ({ ... }),
  isRoot: (node: Node): boolean => node.parentId === null,
  getDepth: (node: Node, allNodes: Node[]): number => { ... },
};
```

### 型アサーション禁止

ライブラリ境界を除き、`as` による型アサーションを禁止する。

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
import { ok, err, Result } from "neverthrow";

// 関数は Result を返す
const findNode = (id: string): ResultAsync<Node, AppError> =>
  ResultAsync.fromPromise(
    repo.findById(id),
    (e) => new AppError("NOT_FOUND", `Node ${id} not found`),
  );

// チェーンで合成
const result = await findNode(id)
  .andThen(validatePermission)
  .andThen(updateNode)
  .match(
    (node) => c.json(node, 200),
    (error) => c.json({ error: error.message }, error.statusCode),
  );
```

```typescript
// ルートハンドラーでのみ try-catch 許可
app.onError((err, c) => {
  // ここだけ try-catch / 例外キャッチが許可される
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});
```

---

## ツールチェイン

### Linter — oxlint (type-aware)

`.oxlintrc.json` で設定。`--typecheck` フラグ付きで実行し、型情報を活用したルールを有効化する。

#### 有効化するルール

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
    // 型アサーション禁止
    "typescript/no-unsafe-type-assertion": "error",
    "typescript/no-non-null-assertion": "error",
    "typescript/no-unnecessary-type-assertion": "error",

    // クラス関連 (完全禁止は no-restricted-syntax 非対応のため部分的)
    "typescript/no-extraneous-class": "error",

    // Promise安全性
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
    "typescript/await-thenable": "error",

    // import整理
    "import/no-cycle": "error",
    "import/no-self-import": "error",

    // その他
    "no-var": "error",
    "prefer-const": "error",
    "no-console": "warn",
    "eqeqeq": "error"
  }
}
```

#### oxlintでカバーできないルール

以下のルールは `no-restricted-syntax` (AST selector) が oxlint 未対応のため、コードレビューで担保する:

| ルール | 対応策 |
|--------|--------|
| クラス宣言の完全禁止 | `no-extraneous-class` で部分カバー + レビュー |
| `try-catch` のルート以外での使用禁止 | レビュー |
| FSD レイヤー間の依存方向 | `import/no-cycle` + レビュー |

> oxlint が将来 `no-restricted-syntax` をサポートした際に移行する。

### Formatter — oxfmt

`.oxfmtrc.json` で設定。

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

### Pre-commit フック

`lefthook` または `husky` + `lint-staged` で以下を実行:

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
    knip:
      run: npx knip --no-progress
    similarity:
      run: similarity-ts . --threshold 0.8
```

| ツール | 目的 |
|--------|------|
| **oxfmt** | コードフォーマット |
| **oxlint** | lint (type-aware) |
| **knip** | 未使用のエクスポート・ファイル・依存の検出 |
| **similarity-ts** | コード重複の検出 |

---

## 命名規則

| 対象 | スタイル | 例 |
|------|----------|-----|
| ファイル名 | kebab-case | `node-service.ts` |
| 型 / インターフェース | PascalCase | `NodeService`, `CreateNodeDto` |
| 関数 / 変数 | camelCase | `findNode`, `nodeCount` |
| 定数 | UPPER_SNAKE_CASE | `MAX_DEPTH`, `DEFAULT_PAGE_SIZE` |
| Zodスキーマ | PascalCase + `Schema` サフィックス | `NodeSchema`, `CreateNodeDtoSchema` |
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
import { NodeSchema } from "@garden/models";
import { CreateNodeDto } from "@garden/dto";

// 3. 同一プロジェクト内の上位レイヤー → 下位レイヤー
import { useNodes } from "~/entities/node";
import { Button } from "~/shared/ui";

// 4. 同一ディレクトリ
import { helper } from "./utils";
```

---

## その他の方針

- **`interface` より `type` を優先**: `type` を基本とし、`interface` は外部ライブラリの拡張 (declaration merging) が必要な場合のみ使用
- **`enum` 禁止**: `as const` オブジェクト + 型推論で代替
- **暗黙の `any` 禁止**: `tsconfig.json` で `noImplicitAny: true`
- **`strict: true`**: TypeScriptの全strictオプション有効
- **barrel exports**: 各スライス/モジュールは `index.ts` でPublic APIを公開
- **副作用の分離**: 純粋関数とI/O関数を明確に分離
