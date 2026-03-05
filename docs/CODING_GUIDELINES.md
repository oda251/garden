# Garden コーディング規約

## アーキテクチャ

### ディレクトリ構成

```
garden/
├── frontend/          # React Router (FSD) → .claude/skills/frontend-coding/
├── backend/           # Hono + tRPC on Cloudflare Workers (FC/IS) → .claude/skills/backend-coding/
├── packages/          # 共有パッケージ (モデル・DTO・バリデーション)
├── infra/             # Terraform (Cloudflare + GitHub)
├── .github/workflows/ # CI/CD (GitHub Actions)
└── docs/
```

領域固有の規約は各スキルを参照。コードレビュー規約は `.claude/skills/code-review/` を参照。

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

## テスト

テストフレームワーク: **vitest**

| 種別 | 対象 | 内容 |
|------|------|------|
| ユニットテスト | `packages/validation/` | バリデーションルールの検証 |
| ユニットテスト | `backend/middleware/` | 認証・エラーハンドリングの検証 |
| e2e | `backend/` | APIエンドポイントの結合テスト |
| e2e | `frontend/` | ユーザーフローのE2Eテスト (Playwright) |

---

## CI/CD — GitHub Actions

### CI (全PR)

```yaml
# .github/workflows/ci.yml
steps:
  - oxfmt --check          # format check
  - oxlint --typecheck     # lint
  - bunx depcruise --cache --config .dependency-cruiser.cjs backend/ frontend/  # 依存方向チェック
  - vitest run             # unit test + backend e2e
  - playwright test        # frontend e2e
```

### CD (mainマージ時)

```yaml
# .github/workflows/cd.yml
on:
  push:
    branches: [main]
steps:
  - wrangler deploy        # backend → Cloudflare Workers
  - wrangler pages deploy  # frontend → Cloudflare Pages
```

---

## インフラ — Terraform

```
infra/
├── main.tf
├── variables.tf
├── cloudflare.tf          # D1, Workers, Pages, DNS
└── github.tf              # repo設定, branch protection
```

Terraform providers: `cloudflare/cloudflare`, `integrations/github`

---

## その他の方針

- **`interface` より `type` を優先**: `interface` は declaration merging が必要な場合のみ
- **`enum` 禁止**: `as const` オブジェクト + 型推論で代替
- **`strict: true`**: TypeScriptの全strictオプション有効
- **barrel exports**: 各スライス/モジュールは `index.ts` でPublic APIを公開
- **パッケージマネージャ**: bun
- **ライブラリは最新版を使用**: インストール時は常に最新の安定版を指定する
