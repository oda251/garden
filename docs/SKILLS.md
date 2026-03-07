# エージェント設計

Claude Code のカスタムエージェントの設計を管理する。

## 方針

- **ドキュメント**: コーディング規約等、参照されるもの (`docs/CODING_GUIDELINES.md`)
- **エージェント**: 必要なドキュメントを自ら読み込み、判断・実行する
- **データソース**: エージェント間の情報共有は GitHub (PR / issue) を唯一のデータソースとする

## エージェント

| 名前 | 役割 | 参照 |
|------|------|------|
| pm | ユーザーとの窓口。タスクの規模を判断し planner / tl に振り分け | `docs/SPEC.md` |
| planner | タスクを sub-issues に分解 | `docs/SPEC.md` + `docs/ARCHITECTURE.md` |
| tl | PR を起点に実装ワークフローを管理 | — |
| coder | 規約に従った実装。レビュー指摘時は PR コメントを読んで修正 | `docs/ARCHITECTURE.md` + `docs/CODING_GUIDELINES.md` + PR |
| cleanup | knip + similarity-ts による未使用コード・重複検出と修正 | — |
| reviewer | 規約準拠のレビュー。結果を PR review として投稿 | `docs/ARCHITECTURE.md` + `docs/CODING_GUIDELINES.md` + PR |
| qa | ビルド・テスト実行による動作検証 | — |

## ワークフロー

```
pm (ユーザーとの窓口)
  ├── planner (タスクが大きい場合)
  │     └── GitHub sub-issues を作成
  └── tl (issue 単位)
        0. ブランチ作成 + draft PR 作成
        1. coder — 実装 → コミット + プッシュ
        2. cleanup    — クリーンアップ → コミット + プッシュ
        3. reviewer   — PR レビュー (approve or changes requested)
           - VIOLATIONS → 1 に戻り修正
           - NEEDS_INPUT → PM 経由でユーザーに中継
        4. qa         — ビルド・テスト実行
           - PASS       → draft 解除、完了
           - FAIL       → 1 に戻り修正
```
