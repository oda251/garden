# Garden コーディング規約

## インポート順序

1. 外部ライブラリ
2. `packages/` (共有パッケージ)
3. 同一プロジェクト内の上位レイヤー → 下位レイヤー
4. 同一ディレクトリ

---

## 型・構文のルール

- **`interface` より `type` を優先**: `interface` は declaration merging が必要な場合のみ
- **`enum` 禁止**: `as const` オブジェクト + 型推論で代替
- **`strict: true`**: TypeScriptの全strictオプション有効
- **クラス禁止**: ライブラリ境界を除き、コンパニオンパターンを使用
- **型アサーション禁止**: `as` 禁止 (`as const` は許可)、Zodパースで型を確定させる
- **barrel exports**: 各スライス/モジュールは `index.ts` でPublic APIを公開

---

## 命名規則

| 対象 | スタイル | 例 |
|------|----------|-----|
| ファイル名 | kebab-case | `node-service.ts` |
| 型 | PascalCase | `NodeService`, `CreateNodeDto` |
| 関数 / 変数 | camelCase | `findNode`, `nodeCount` |
| 定数 | UPPER_SNAKE_CASE | `MAX_DEPTH` |
| Zodスキーマ | PascalCase + `Schema` | `NodeSchema` |
| React コンポーネント | PascalCase | `GraphView` |
| React hooks | `use` プレフィックス | `useNodes` |
| イベントハンドラー | `handle` プレフィックス | `handleNodeClick` |
| boolean変数 | `is` / `has` / `can` プレフィックス | `isRoot` |

---

## その他

- **パッケージマネージャ**: bun
- **ライブラリは最新版を使用**: インストール時は常に最新の安定版を指定する
