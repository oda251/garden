---
name: code-review
description: Code review checklist based on coding rules - class prohibition, type assertion, neverthrow, companion pattern
---

# コードレビュー チェックリスト

以下の項目を順にチェックしてください。

## 1. クラス禁止

ライブラリ境界 (Better Auth設定、Hono拡張等) を除き、クラスの使用を禁止する。

```typescript
// BAD
class NodeService {
  constructor(private repo: NodeRepository) {}
  async getById(id: string) { ... }
}

// GOOD: コンパニオンパターン
export type NodeService = {
  getById: (id: string) => ResultAsync<Node, AppError>;
};

export const NodeService = {
  create: (repo: NodeRepository): NodeService => ({
    getById: (id) => repo.findById(id),
  }),
};
```

## 2. 型アサーション禁止

ライブラリ境界を除き、`as` による型アサーションを禁止する。`as const` は許可。

```typescript
// BAD
const user = data as User;

// GOOD
const parsed = UserSchema.safeParse(data);
if (parsed.success) {
  const user = parsed.data;
}
```

## 3. try-catch の制限

`try-catch` はアプリケーションのルート (エントリポイント) でのみ使用する。それ以外では `neverthrow` の `Result` 型を使う。

## 4. neverthrow の Result 型パターンの遵守

- `ResultAsync.fromPromise` で外部呼び出しをラップ
- `.andThen` でチェーン
- `.match` で最終的なレスポンス変換

## 5. コンパニオンパターンの適用

型と同名のオブジェクトを定義し、名前空間的に使用する。packages/schema/ に型と同居させる。

```typescript
export type Node = typeof NodeSchema._type;

export const Node = {
  isRoot: (node: Node): boolean => node.parentId === null,
  getDepth: (node: Node, allNodes: Node[]): number => { ... },
};
```

## 6. Zustand の最小限使用

Zustand はクライアントのみの高頻度更新状態 (グラフのズーム/パン/ドラッグ等) に限定する。以下は Zustand ではなく React Router の loader/action + URL params + cookies で管理すること:
- サーバーから取得したデータ
- URLで表現できる状態 (フィルタ、ソート、ページネーション等)
- ユーザー設定 (cookies)

## 7. 命名規則の遵守

| 対象 | スタイル | 例 |
|------|----------|-----|
| ファイル名 | kebab-case | `node-service.ts` |
| 型 | PascalCase | `NodeService`, `CreateNodeDto` |
| 関数 / 変数 | camelCase | `findNode`, `nodeCount` |
| 定数 | UPPER_SNAKE_CASE | `MAX_DEPTH`, `DEFAULT_PAGE_SIZE` |
| Zodスキーマ | PascalCase + `Schema` | `NodeSchema`, `CreateNodeDtoSchema` |
| React コンポーネント | PascalCase | `GraphView`, `NodeCard` |
| React hooks | `use` プレフィックス | `useNodes`, `useGraphLayout` |
| イベントハンドラー | `handle` プレフィックス | `handleNodeClick` |
| boolean変数 | `is` / `has` / `can` プレフィックス | `isRoot`, `hasChildren` |

## 補足: oxlint 未対応ルール

以下は oxlint の `no-restricted-syntax` 非対応のため、レビューで補完する。

| ルール | 対応策 |
|--------|--------|
| クラス宣言の完全禁止 | `no-extraneous-class` で部分カバー + このレビュー |
| `try-catch` のルート以外での使用禁止 | このレビュー |
