# ツールチェイン・インフラ

## Linter — oxlint (type-aware)

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

## 依存方向の強制 — dependency-cruiser

バックエンド・フロントエンド両方のレイヤー間依存ルールを静的に検証する。

```bash
bunx depcruise --config .dependency-cruiser.cjs backend/ frontend/
```

- `--cache` でキャッシュ有効化 (2回目以降高速)
- `tsPreCompilationDeps: true` でTS直接解析
- CI または pre-commit で実行

## Formatter — oxfmt

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

## Pre-commit フック — lefthook

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

## 実装完了時チェック

プロジェクト全体を走査するため、pre-commitではなく実装完了時に実行する。

```bash
bunx knip --no-progress
bunx similarity-ts . --threshold 0.8
```

---

## テスト

### 方針

- **Core はユニットテスト、Shell は上位テストでカバー** (FC/IS に準拠)
- バックエンド単体の e2e は書かない。tRPC + Zod が境界を型で保証するため
- カバレッジ閾値: **90%** (CI で計測し、下回ったら失敗)
- テストファイルは対象ファイルの隣に配置 (コロケーション: `foo.ts` → `foo.test.ts`)

### テスト構成

| 種別 | フレームワーク | 対象 | 内容 |
|------|--------------|------|------|
| tRPC プロシージャテスト | vitest + Testcontainers (SQLite) | `backend/router/` | `createCaller` で プロシージャを呼び出し、実 DB で検証。usecases・adapters・Drizzle クエリを一括カバー |
| ユニットテスト | vitest | `backend/middleware/` | 認証・CORS 等のミドルウェア単体検証 |
| ユニットテスト | vitest | `packages/schema/` | コンパニオン (`Node.isRoot()` 等) + バリデーションロジック |
| Playwright + MSW | Playwright | `frontend/` | UI の振る舞い・ユーザーフロー。バックエンド通信は MSW でモック |

### 認証コンテキスト

tRPC テストでは、ファクトリ関数で ctx を生成する。Better Auth の型推論をそのまま使い、Zod での二重検証はしない。

```typescript
// テスト用ファクトリ
const asAdmin = () => ({ user: { id: "admin-1", role: "admin" }, session: { ... } });
const asUser = (id = "user-1") => ({ user: { id, role: "user" }, session: { ... } });
const asAnonymous = () => ({ user: null, session: null });

// 使用例 — 認証済みユーザー
const adminCaller = createCaller(asAdmin());
const node = await adminCaller.node.create({ title: "テスト" });

// 使用例 — 未認証
const anonCaller = createCaller(asAnonymous());
await anonCaller.node.create({ ... }); // → unauthorized
```

### テストデータ生成

`packages/mock/` の zod-schema-faker を使用。seed 固定で再現性を担保する。

```typescript
import { generateMock } from "zod-schema-faker";
import { InsertNodeSchema } from "@garden/schema";

generateMock.seed(42);
const mockNode = generateMock(InsertNodeSchema);
```

### 命名規則

- `describe`: プロシージャ名またはモジュール名 (`"node.create"`, `"Node.isRoot"`)
- `it`: 日本語で条件と期待結果を書く (`"親ノードが存在しない場合はエラーを返す"`)

```typescript
describe("node.create", () => {
  it("タイトルとコンテンツを指定してノードを作成できる", async () => { ... });
  it("未認証の場合は unauthorized を返す", async () => { ... });
  it("親ノードが存在しない場合はエラーを返す", async () => { ... });
});
```

---

## エラー追跡・監視 — Sentry

バックエンド (Cloudflare Workers) とフロントエンド両方に Sentry を導入する。

- **バックエンド**: `@sentry/cloudflare` (Workers SDK)
- **フロントエンド**: `@sentry/react`
- neverthrow の Result チェーンで処理しきれなかった未処理例外を Sentry に送信
- パフォーマンス監視 (トレース) も Sentry で一本化

---

## CI/CD — GitHub Actions

### CI (全PR)

```yaml
# .github/workflows/ci.yml
steps:
  - oxfmt --check          # format check
  - oxlint --typecheck     # lint
  - terraform fmt -check -recursive infra/  # Terraform format check
  - bunx depcruise --cache --config .dependency-cruiser.cjs backend/ frontend/  # 依存方向チェック
  - vitest run --coverage  # unit test + tRPC プロシージャテスト (カバレッジ 90% 閾値)
  - playwright test        # frontend Playwright + MSW
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

### Formatter — terraform fmt

```bash
terraform fmt -recursive infra/
```

- CI では `terraform fmt -check -recursive infra/` で未フォーマットを検出
- pre-commit (lefthook) でも自動フォーマットを実行
