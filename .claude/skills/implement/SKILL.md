---
name: implement
description: Orchestrate implementation workflow - triggers when user requests feature implementation, bug fixes, or code changes. Chains implementer → cleanup → reviewer agents.
---

# 実装ワークフロー

ユーザーから実装・修正の指示を受けたら、以下の3ステップを順番に実行してください。

## ステップ 1: 実装 (implementer エージェント)

Agent ツールで `implementer` エージェントを起動し、ユーザーの指示を渡す。

- `subagent_type: "implementer"` を指定
- ユーザーの要件を具体的にプロンプトに含める
- 対象ファイルや関連コンテキストがあれば添える

## ステップ 2: クリーンアップ (cleanup エージェント)

実装が完了したら、Agent ツールで `cleanup` エージェントを起動する。

- `subagent_type: "cleanup"` を指定
- 「実装で変更されたファイルを対象に knip と similarity-ts を実行してください」と指示
- 修正が発生した場合、その内容をユーザーに報告

## ステップ 3: レビュー (reviewer エージェント)

クリーンアップ完了後、Agent ツールで `reviewer` エージェントを起動する。

- `subagent_type: "reviewer"` を指定
- 「直近の変更差分をレビューしてください」と指示

### レビュー結果の処理

- **PASS**: ユーザーに完了を報告
- **FAIL**: 指摘事項をユーザーに共有し、修正するか確認する。修正する場合はステップ1に戻る

## 注意事項

- 各エージェントは独立したコンテキストで動くため、必要な情報はプロンプトで渡すこと
- コミットはワークフロー完了後にメインエージェント (自分自身) が行う
- 小さな修正 (typo、コメント追加等) ではこのワークフローを使わず直接対応してよい
