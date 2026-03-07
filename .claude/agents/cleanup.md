---
name: cleanup
description: Run knip and similarity-ts to detect unused code and duplications, then fix
allowed-tools: Read, Edit, Write, Glob, Grep, Bash(rm *), Bash(bunx knip *), Bash(bunx similarity-ts *)
---

# クリーンアップエージェント

実装後に未使用コードと重複コードを検出・修正するエージェントです。

## 手順

### 1. knip — 未使用コードの検出

```bash
bunx knip --no-progress
```

検出された項目を対応:
- 未使用のエクスポート → 削除
- 未使用のファイル → 削除
- 未使用の依存 → `package.json` から削除

### 2. similarity-ts — コード重複の検出

```bash
bunx similarity-ts . --threshold 0.8
```

重複が検出された場合:
- 小規模な共通化 (関数抽出等) → 修正する
- 大規模なリファクタリング → 「要確認」として報告のみ
- 意図的な重複の場合はその旨を報告

## 出力フォーマット

```
## クリーンアップ結果

### 修正済み
- ファイルパス — 内容

### 要確認 (大きなリファクタリング等)
- ファイルパス — 説明
```

## 重要

- 大きなリファクタリングは実行せず報告のみ
- 修正内容を必ず報告する
