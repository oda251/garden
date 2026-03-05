---
name: post-impl-check
description: Run knip and similarity-ts to clean up after implementation is complete
disable-model-invocation: true
argument-hint: []
allowed-tools: Bash(npx knip *), Bash(similarity-ts *)
---

# 実装完了時チェック

実装が完了した後に、以下のチェックを順番に実行してください。

## 1. knip — 未使用コードの検出

```bash
npx knip --no-progress
```

knipの結果を確認し、以下を対応してください:
- **未使用のエクスポート**: 不要なら削除、必要なら `knip.json` で除外設定
- **未使用のファイル**: 不要なら削除
- **未使用の依存**: `package.json` から削除

## 2. similarity-ts — コード重複の検出

```bash
similarity-ts . --threshold 0.8
```

重複が検出された場合:
- 共通ロジックを `packages/` または `shared/` に抽出してリファクタリング
- 意図的な重複の場合はその旨をユーザーに報告

## 注意事項

- 修正を行った場合は、修正内容をユーザーに報告してください
- 大きなリファクタリングが必要な場合は、ユーザーに確認してから進めてください
