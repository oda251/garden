# Garden アーキテクチャ

## バックエンド — Functional Core / Imperative Shell

- Core (usecases, domain) は純粋関数。Shell (router, adapters, middleware) は副作用を扱う
- 単純な CRUD は router から直接 Drizzle を使ってよい。usecase 層を経由するのはビジネスロジックがある場合のみ
- 依存方向: `router → usecases → domain ← adapters`、`middleware → domain`

## フロントエンド — Feature-Sliced Design

- 依存方向: `app → pages → widgets → features → entities → shared`
- 上位レイヤーは下位レイヤーにのみ依存可能 (逆方向・同レイヤー間の依存禁止)
- 各スライスは `index.ts` で公開APIを定義

## packages/ — Single Source of Truth

- Drizzle テーブル定義 + drizzle-zod が唯一の型定義元
- 型のコンパニオンパターンも `schema/` に同居させる
- バリデーション (refine/superRefine) は `schema/` に同居させ、ロジックは純粋関数として export する
- DTO は検証済み schema から `.pick()` / `.omit()` / `.extend()` で派生
- 依存方向: `dto → schema`、`mock → schema`

## テスト

### 方針

- **Core はユニットテスト、Shell は上位テストでカバー** (FC/IS に準拠)
- バックエンド単体の e2e は書かない。tRPC + Zod が境界を型で保証するため
- カバレッジ閾値: **90%** (CI で計測し、下回ったら失敗)
- テストファイルは対象ファイルの隣に配置 (コロケーション: `foo.ts` → `foo.test.ts`)

### 構成

| 種別 | フレームワーク | 対象 | 内容 |
|------|--------------|------|------|
| tRPC プロシージャテスト | vitest + Testcontainers (SQLite) | `backend/router/` | `createCaller` でプロシージャを呼び出し、実 DB で検証。usecases・adapters・Drizzle クエリを一括カバー |
| ユニットテスト | vitest | `backend/middleware/` | 認証・CORS 等のミドルウェア単体検証 |
| ユニットテスト | vitest | `packages/schema/` | コンパニオン (`Node.isRoot()` 等) + バリデーションロジック |
| Playwright + MSW | Playwright | `frontend/` | UI の振る舞い・ユーザーフロー。バックエンド通信は MSW でモック |
