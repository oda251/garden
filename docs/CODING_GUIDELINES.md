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
