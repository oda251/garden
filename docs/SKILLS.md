# スキル・エージェント設計

Claude Code のスキルとサブエージェントの設計を管理する。

## 方針

- **スキル**: オーケストレーション等、トリガーされて動くもの
- **ドキュメント**: コーディング規約・レビューチェックリスト等、参照されるもの (`docs/CODING_GUIDELINES.md`)
- **サブエージェント**: 必要なドキュメントを自ら読み込み、判断・実行する

## スキル

| スキル名 | 概要 |
|----------|------|
| implement | implementer → cleanup → reviewer を直列実行するオーケストレーター |

## サブエージェント

| 名前 | 参照ドキュメント | 概要 |
|------|-----------------|------|
| implementer | `docs/CODING_GUIDELINES.md` (対象領域のセクション) | 規約に従った実装 |
| cleanup | — | knip + similarity-ts による未使用コード・重複検出と修正 |
| reviewer | `docs/CODING_GUIDELINES.md` (レビューチェックリスト) | 規約準拠のレビュー |

### ワークフロー

`implement` スキル (オーケストレーター) が以下の順に直列でサブエージェントを呼び出す。
reviewer はクリーンアップ済みのコードを対象とするため、直列接続が必須。

```
implement (オーケストレーター)
  1. implementer — 実装
  2. cleanup    — 未使用コード・重複の検出と修正
  3. reviewer   — コーディングルール準拠のレビュー
```

### implementer

- **目的**: 規約に従った実装
- **参照**: `docs/CODING_GUIDELINES.md` を Read で読み込み、対象領域 (バックエンド/フロントエンド) のセクションに従う
- **出力**: DONE / BLOCKED / 仕様確認事項

### cleanup

- **目的**: 実装後の未使用コード・重複コードの検出と修正
- **処理**: `bunx knip` + `bunx similarity-ts` を実行し、検出結果に応じて自動修正。大きなリファクタリングは報告のみ

### reviewer

- **目的**: コーディングルール準拠のレビュー
- **参照**: `docs/CODING_GUIDELINES.md` を Read で読み込み、規約に基づきレビュー
- **処理**: 機械的に修正できるものは自動修正、仕様判断が必要なものは報告のみ
- **出力**: PASS / FIXED / NEEDS_INPUT
