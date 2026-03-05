# スキル・エージェント設計

Claude Code のスキルとサブエージェントの設計を管理する。

## 方針

- **スキル**: 固定コマンド列、または特定領域のコーディング規約を提供
- **サブエージェント**: スキルを参照し、判断・実行する
- CODING_GUIDELINES.md は共通部分 (packages/、ツールチェイン、命名規則、インポート順序、CI/CD、インフラ、その他の方針) のみ残す
- 領域固有の規約はスキルに分離し、サブエージェントが必要な分だけ参照する

## スキル

| スキル名 | 概要 | ステータス |
|----------|------|-----------|
| frontend-coding | FSD構成・状態管理等のフロントエンド規約 | 未実装 |
| backend-coding | FC/IS構成・neverthrow等のバックエンド規約 | 未実装 |
| code-review | コーディングルールのレビューチェックリスト | 未実装 |
| post-impl-check | knip + similarity-ts による実装完了時チェック | 実装済み |

### frontend-coding

- **内容** (CODING_GUIDELINES.md から分離):
  - FSD ディレクトリ構成・依存方向
  - レイヤー間ルール (上位→下位のみ、同一レイヤー間参照禁止、Public API パターン)
  - 状態管理: React Router loader/action + URL params + cookies 優先、Zustand は最小限
  - フロントエンド固有のサンプルコード

### backend-coding

- **内容** (CODING_GUIDELINES.md から分離):
  - FC/IS ディレクトリ構成・依存方向
  - neverthrow による ResultAsync エラーハンドリング
  - AppError コンパニオンパターン
  - バックエンド固有のサンプルコード

### code-review

- **内容** (CODING_GUIDELINES.md のコーディングルールを分離):
  - クラス使用の有無 (ライブラリ境界以外)
  - 型アサーション (`as`) の使用 (`as const` は除外)
  - try-catch のルート以外での使用
  - neverthrow の Result 型パターンの遵守
  - コンパニオンパターンの適用
  - oxlint 未対応ルールの補完 (クラス宣言完全禁止、try-catch 制限)

### post-impl-check

- **実行**: `/post-impl-check`
- **処理**:
  1. `bunx knip --no-progress` — 未使用エクスポート・ファイル・依存の検出
  2. `similarity-ts . --threshold 0.8` — コード重複の検出

## サブエージェント

| 名前 | 参照スキル | 概要 | ステータス |
|------|-----------|------|-----------|
| coder | frontend-coding or backend-coding + post-impl-check | 実装 + 品質チェック | 未実装 |
| reviewer | code-review | CODING_GUIDELINES 準拠のレビュー | 未実装 |

### coder

- **目的**: 領域固有の規約に従った実装 + 品質チェック
- **トリガー**: 実装タスク完了時
- **処理**:
  1. 対象領域のスキル (frontend-coding / backend-coding) を参照して実装
  2. `/post-impl-check` スキルを実行
  3. 検出結果に応じて自動修正。大きな変更はユーザー確認後に実施

### reviewer

- **目的**: コーディングルール準拠のレビュー
- **入力**: 引数なし (ステージされた差分) または ファイル/ディレクトリ指定
- **処理**: code-review スキルのチェックリストに基づきレビュー
