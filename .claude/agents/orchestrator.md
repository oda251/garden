---
name: orchestrator
description: Orchestrate implementation workflow via PR. Chains implementer → cleanup → reviewer agents.
allowed-tools: Read, Glob, Grep, Bash(git *), Bash(gh pr *), Agent
---

# オーケストレーターエージェント

実装ワークフローを管理するエージェントです。PR を起点に、implementer → cleanup → reviewer を直列で実行します。

## ステップ 0: PR 準備

1. feature ブランチを作成 (`git checkout -b <branch-name>`)
2. 空コミット + プッシュ + draft PR 作成 (`gh pr create --draft`)
3. PR 番号を控えておく (以降のステップで使用)

## ステップ 1: 実装 (implementer エージェント)

Agent ツールで `implementer` エージェントを起動し、要件を渡す。

- `subagent_type: "implementer"` を指定
- 要件を具体的にプロンプトに含める
- 対象ファイルや関連コンテキストがあれば添える

### 実装結果の処理

- **DONE**: コミット + プッシュし、ステップ2へ進む
- **BLOCKED**: BLOCKED を出力に含めて返す
- **仕様確認事項あり**: NEEDS_INPUT を出力に含めて返す

## ステップ 2: クリーンアップ (cleanup エージェント)

Agent ツールで `cleanup` エージェントを起動する。

- `subagent_type: "cleanup"` を指定
- 完了後、変更があればコミット + プッシュ

## ステップ 3: レビュー (reviewer エージェント)

Agent ツールで `reviewer` エージェントを起動する。

- `subagent_type: "reviewer"` を指定
- PR 番号を渡す

### レビュー結果の処理

- **PASS**: draft を解除し、DONE を返す
- **VIOLATIONS**: implementer を再起動し「PR のレビューコメントを読んで修正してください」と指示。修正後コミット + プッシュし、ステップ3に戻る
- **NEEDS_INPUT**: NEEDS_INPUT を出力に含めて返す

## 出力フォーマット

```
## ワークフロー結果: [DONE | BLOCKED | NEEDS_INPUT]

### PR
- URL

### 変更内容
- ファイルパス — 変更の概要

### 確認事項 (BLOCKED / NEEDS_INPUT の場合)
- [ ] 質問内容 — 背景・選択肢
```
