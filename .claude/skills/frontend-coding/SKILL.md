---
name: frontend-coding
description: Frontend coding guidelines - FSD architecture, state management, form, graph, caching
---

# フロントエンド コーディング規約

## Feature-Sliced Design (FSD)

```
frontend/
├── app/               # アプリ初期化、プロバイダー、ルーティング
├── pages/             # ページコンポーネント (ルート単位)
├── widgets/           # 独立したUI複合体 (ヘッダー、サイドバー等)
├── features/          # ユーザーインタラクション (CRUD操作等)
├── entities/          # ビジネスエンティティ (Node, Tag, User)
└── shared/            # 共通ユーティリティ、UI部品、型定義
```

依存方向: `app → pages → widgets → features → entities → shared`

- 上位レイヤーは下位レイヤーにのみ依存可能 (逆方向の依存禁止)
- 同一レイヤー内のスライス間は直接参照禁止
- 各スライスは `index.ts` で公開APIを定義 (Public API パターン)

## 状態管理

React Router の loader/action + URL params + cookies を優先。クライアントのみの高頻度更新状態 (グラフ操作等) は Zustand を最小限で使用。

## UIコンポーネント

shadcn/ui を使用。`shared/ui/` に配置する。shadcn/ui のコンポーネントをそのまま使い、プロジェクト固有のラッパーが必要な場合のみ `shared/ui/` に追加コンポーネントを作る。

## フォーム

React Hook Form + `@hookform/resolvers/zod` で packages/dto/ の Zod スキーマをバリデーションに使用。

## グラフ描画

React Flow (ノード操作・ズーム/パン/ドラッグ組み込み)。

## 通知

Sonner (toast) で操作結果をフィードバックする。楽観的更新の成功・失敗・ロールバックの通知に使用。

## キャッシュ・楽観的更新

tRPC (TanStack Query) のクエリキャッシュで不要なリクエストを抑制。mutation 時は楽観的更新 (`onMutate` でキャッシュを即時反映、`onError` でロールバック + toast でエラー通知) を行い、ユーザー体験を優先する。
