# Garden コーディング規約

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

## インポート順序

1. 外部ライブラリ
2. `packages/` (共有パッケージ)
3. 同一プロジェクト内の上位レイヤー → 下位レイヤー
4. 同一ディレクトリ

---

## バックエンド

### エラーハンドリング — neverthrow

- `try-catch` はアプリケーションのルート (エントリポイント) でのみ使用
- それ以外では `ResultAsync.fromPromise` → `.andThen` → `.match`
- エラー型 `AppError` をコンパニオンパターンで定義 (`AppError.notFound()` 等)

### キャッシュ

Cloudflare Cache API でD1クエリ結果をエッジキャッシュ (TTL は Cache-Control で制御)。

---

## フロントエンド

### 状態管理の使い分け

| 状態の種類 | 管理方法 |
|-----------|---------|
| サーバーデータ | tRPC (TanStack Query) |
| URL で表現できる状態 (フィルタ、ソート等) | URL params |
| ユーザー設定 | cookies |
| グラフ操作 (ズーム/パン/ドラッグ) | Zustand |

### 楽観的更新

mutation 時は `onMutate` でキャッシュを即時反映、`onError` でロールバック + Sonner toast でエラー通知。

### フォーム

React Hook Form + `@hookform/resolvers/zod` で `packages/dto/` の Zod スキーマをバリデーションに使用。

---

## packages/

- DTO は Zod スキーマを `.pick()`, `.omit()`, `.extend()` 等で加工して生成
- `refine` / `superRefine` によるビジネスバリデーションは `validation/` で一元管理
- モックデータは `zod-schema-faker` で Zod スキーマから自動生成 (seed 対応で再現性あり)

---

## その他

- **パッケージマネージャ**: bun
- **ライブラリは最新版を使用**: インストール時は常に最新の安定版を指定する
