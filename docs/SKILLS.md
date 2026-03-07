# エージェント設計

Claude Code のカスタムエージェントの設計を管理する。

## 方針

- **ドキュメント**: コーディング規約等、参照されるもの (`docs/CODING_GUIDELINES.md`)
- **エージェント**: 必要なドキュメントを自ら読み込み、判断・実行する
- **データソース**: エージェント間の情報共有は GitHub PR を唯一のデータソースとする

## エージェント

| 名前 | 役割 | 参照 |
|------|------|------|
| orchestrator | PR を起点に実装ワークフローを管理 | — |
| implementer | 規約に従った実装。レビュー指摘時は PR コメントを読んで修正 | `docs/CODING_GUIDELINES.md` + PR |
| cleanup | knip + similarity-ts による未使用コード・重複検出と修正 | — |
| reviewer | 規約準拠のレビュー。結果を PR review として投稿 | `docs/CODING_GUIDELINES.md` + PR |

## ワークフロー

```
orchestrator
  0. ブランチ作成 + draft PR 作成
  1. implementer — 実装 → コミット + プッシュ
  2. cleanup    — クリーンアップ → コミット + プッシュ
  3. reviewer   — PR レビュー (approve or changes requested)
     - PASS       → draft 解除、完了
     - VIOLATIONS → 1 に戻り、implementer が PR レビューコメントを読んで修正
     - NEEDS_INPUT → 呼び出し元に中継
```
