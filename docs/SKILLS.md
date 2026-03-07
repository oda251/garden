# スキル・エージェント設計

Claude Code のスキルとサブエージェントの設計を管理する。

## 方針

- **スキル**: 固定コマンド列、または特定領域のコーディング規約を提供
- **サブエージェント**: スキルを参照し、判断・実行する
- CODING_GUIDELINES.md は共通部分 (packages/、ツールチェイン、インポート順序、テスト、CI/CD、インフラ、その他の方針) のみ
- 領域固有の規約はスキルに分離し、サブエージェントが必要な分だけ参照する

## スキル

| スキル名 | 概要 |
|----------|------|
| frontend-coding | FSD構成・状態管理・フォーム・グラフ・キャッシュ |
| backend-coding | FC/IS構成・Hono+tRPC・neverthrow・キャッシュ |
| code-review | コーディングルールのレビューチェックリスト |
| implement | implementer → cleanup → reviewer を直列実行するオーケストレーター |

## サブエージェント

| 名前 | 参照スキル | 概要 |
|------|-----------|------|
| implementer | frontend-coding / backend-coding | 領域固有の規約に従った実装 |
| cleanup | — | knip + similarity-ts による未使用コード・重複検出と修正 |
| reviewer | code-review | CODING_GUIDELINES 準拠のレビュー |

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

- **目的**: 領域固有の規約に従った実装
- **参照**: 対象領域のスキル (frontend-coding / backend-coding)
- **出力**: DONE / BLOCKED / 仕様確認事項

### cleanup

- **目的**: 実装後の未使用コード・重複コードの検出と修正
- **処理**: `bunx knip` + `bunx similarity-ts` を実行し、検出結果に応じて自動修正。大きなリファクタリングは報告のみ

### reviewer

- **目的**: コーディングルール準拠のレビュー
- **入力**: 直近の変更差分
- **処理**: code-review スキルのチェックリストに基づきレビュー。機械的に修正できるものは自動修正
- **出力**: PASS / FIXED / NEEDS_INPUT
