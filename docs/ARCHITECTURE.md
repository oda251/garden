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
- 依存方向: `validation → dto → schema`、`mock → schema`
