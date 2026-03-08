# Garden コーディング規約

## 型・構文のルール

- **`interface` より `type` を優先**: `interface` は declaration merging が必要な場合のみ
- **`enum` 禁止**: `as const` オブジェクト + 型推論で代替
- **列挙値の管理**: DB カラムは `text` で保存し、アプリケーション層で `as const` オブジェクト + `z.enum()` により型安全に制約する
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

- バリデーション (`refine` / `superRefine`) は `schema/` 内で Zod スキーマに組み込む
- バリデーションロジックは純粋関数として export し、ユニットテスト可能にする
- DTO は検証済みスキーマを `.pick()`, `.omit()`, `.extend()` 等で加工して生成
- モックデータは `zod-schema-faker` で Zod スキーマから自動生成 (seed 対応で再現性あり)

---

## テスト

### 命名規則

- `describe`: プロシージャ名またはモジュール名 (`"node.create"`, `"Node.isRoot"`)
- `it`: 日本語で条件と期待結果を書く (`"親ノードが存在しない場合はエラーを返す"`)

```typescript
describe("node.create", () => {
  it("タイトルとコンテンツを指定してノードを作成できる", async () => { ... });
  it("未認証の場合は unauthorized を返す", async () => { ... });
  it("親ノードが存在しない場合はエラーを返す", async () => { ... });
});
```

### 認証コンテキスト

tRPC テストでは、ファクトリ関数で ctx を生成する。Better Auth の型推論をそのまま使い、Zod での二重検証はしない。

```typescript
const asAdmin = () => ({ user: { id: "admin-1", role: "admin" }, session: { ... } });
const asUser = (id = "user-1") => ({ user: { id, role: "user" }, session: { ... } });
const asAnonymous = () => ({ user: null, session: null });

const adminCaller = createCaller(asAdmin());
const node = await adminCaller.node.create({ title: "テスト" });

const anonCaller = createCaller(asAnonymous());
await anonCaller.node.create({ ... }); // → unauthorized
```

### テストデータ生成

`packages/mock/` の zod-schema-faker を使用。seed 固定で再現性を担保する。

```typescript
import { generateMock } from "zod-schema-faker";
import { InsertNodeSchema } from "@garden/schema";

generateMock.seed(42);
const mockNode = generateMock(InsertNodeSchema);
```

---

## その他

- **パッケージマネージャ**: bun
- **ライブラリは最新版を使用**: インストール時は常に最新の安定版を指定する
