# ツールチェイン・インフラ

## 依存方向の強制 — dependency-cruiser

バックエンド・フロントエンド両方のレイヤー間依存ルールを静的に検証する。

```bash
bunx depcruise --config .dependency-cruiser.cjs backend/ frontend/
```

- `--cache` でキャッシュ有効化 (2回目以降高速)
- `tsPreCompilationDeps: true` でTS直接解析
- CI または pre-commit で実行

---

## エラー追跡・監視 — Sentry

バックエンド (Cloudflare Workers) とフロントエンド両方に Sentry を導入する。

- **バックエンド**: `@sentry/cloudflare` (Workers SDK)
- **フロントエンド**: `@sentry/react`
- neverthrow の Result チェーンで処理しきれなかった未処理例外を Sentry に送信
- パフォーマンス監視 (トレース) も Sentry で一本化

---
