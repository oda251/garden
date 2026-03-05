# Skills 設計

Claude Codeのカスタムスキル (`.claude/skills/<name>/SKILL.md`) の設計を管理する。

## スキル一覧

| スキル名 | トリガー | 概要 | ステータス |
|----------|----------|------|-----------|
| post-impl-check | 手動 | knip + similarity-ts による実装完了時チェック | 実装済み |
| review | 手動 | コーディング規約に基づくコードレビュー | 未実装 |
| gen-schema | 手動 | Drizzleテーブル + drizzle-zodスキーマの雛形生成 | 未実装 |
| gen-feature | 手動 | FSDスライスの雛形生成 (frontend) | 未実装 |
| gen-usecase | 手動 | ユースケースの雛形生成 (backend) | 未実装 |
| migrate | 手動 | Drizzle Kit マイグレーション実行 | 未実装 |
| coding-guidelines | 自動 | コーディング規約の参照 (コード生成時に自動ロード) | 未実装 |

---

## 各スキル設計

### post-impl-check

- **目的**: 実装完了後に未使用コード・コード重複を検出
- **実行タイミング**: `/post-impl-check`
- **処理内容**:
  1. `bunx knip --no-progress` — 未使用エクスポート・ファイル・依存の検出
  2. `similarity-ts . --threshold 0.8` — コード重複の検出
- **対応方針**: 検出結果に応じて削除またはリファクタリングを提案。大きな変更はユーザー確認後に実施
- **ステータス**: 実装済み (`.claude/skills/post-impl-check/SKILL.md`)

### review

- **目的**: CODING_GUIDELINES.md に基づくコードレビュー
- **実行タイミング**: `/review` または `/review <ファイル/ディレクトリ>`
- **チェック対象**:
  - クラス使用の有無 (ライブラリ境界以外)
  - 型アサーション (`as`) の使用 (`as const` は除外)
  - try-catch のルート以外での使用
  - neverthrow の Result 型パターンの遵守
  - 命名規則の遵守
  - コンパニオンパターンの適用

### gen-schema

- **目的**: packages/schema/ にDrizzleテーブル + drizzle-zodスキーマの雛形を生成
- **実行タイミング**: `/gen-schema <テーブル名> <カラム定義...>`
- **生成物**:
  - `packages/schema/<name>.ts` — テーブル定義 + createSelectSchema / createInsertSchema
  - `packages/dto/<name>.ts` — DTO雛形
  - `packages/validation/<name>.ts` — バリデーション雛形

### gen-feature

- **目的**: FSD のフィーチャースライス雛形を生成
- **実行タイミング**: `/gen-feature <スライス名>`
- **生成物**:
  - `frontend/features/<name>/index.ts` — Public API
  - `frontend/features/<name>/ui/` — UIコンポーネント
  - `frontend/features/<name>/model/` — ストア・ロジック
  - `frontend/features/<name>/api/` — API呼び出し

### gen-usecase

- **目的**: ユースケース雛形を生成 (ドメインロジックがある場合のみ)
- **実行タイミング**: `/gen-usecase <ユースケース名>`
- **生成物**:
  - `backend/usecases/<name>.ts` — ユースケース (Result型を返す純粋関数)

### migrate

- **目的**: Drizzle Kit によるマイグレーション操作
- **実行タイミング**: `/migrate [generate|push|drop]`
- **処理内容**:
  - `generate`: `bunx drizzle-kit generate`
  - `push`: `bunx drizzle-kit push`
  - `drop`: `bunx drizzle-kit drop`
- **注意**: push/drop は破壊的操作のためユーザー確認を挟む

### coding-guidelines

- **目的**: コード生成・編集時にコーディング規約を自動参照させる
- **実行タイミング**: Claude が自動ロード (`disable-model-invocation: false`)
- **設計意図**: CODING_GUIDELINES.md 全文をロードすると重いため、スキルとして要点のみを提供
