# Garden — ノードグラフ ドキュメンテーションツール 仕様書

## 概要

階層型グラフ構造を持つドキュメンテーションツール。ノード間の親子関係とタグによる分類を基盤とし、グラフビュー・時系列ビュー・アーティクルビューの3つの表示形式を提供する。

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| バックエンド | Hono (Cloudflare Workers) |
| フロントエンド | React Router |
| データベース | Cloudflare D1 (SQLite) |
| 認証 | Better Auth |
| デプロイ | Cloudflare |

## データモデル

### ノード (nodes)

各ノードはドキュメントの最小単位であり、親子関係により階層型グラフを構成する。

| カラム | 型 | 説明 |
|--------|------|------|
| id | TEXT (PK) | 一意識別子 (ULID等) |
| parent_id | TEXT (FK → nodes.id, nullable) | 親ノードID。nullの場合はルートノード |
| title | TEXT NOT NULL | ノードのタイトル |
| content | TEXT | Markdown形式の本文 |
| created_by | TEXT (FK → users.id) | 作成者 |
| created_at | TEXT NOT NULL | 作成日時 (ISO 8601) |
| updated_at | TEXT NOT NULL | 更新日時 (ISO 8601) |

### タグ (tags)

| カラム | 型 | 説明 |
|--------|------|------|
| id | TEXT (PK) | 一意識別子 |
| name | TEXT NOT NULL UNIQUE | タグ名 |

### ノード-タグ関連 (node_tags)

| カラム | 型 | 説明 |
|--------|------|------|
| node_id | TEXT (FK → nodes.id) | ノードID |
| tag_id | TEXT (FK → tags.id) | タグID |
| PRIMARY KEY | (node_id, tag_id) | 複合主キー |

### ユーザー (users)

Better Authが管理するユーザーテーブル。アプリケーション固有の拡張カラムを含む。

| カラム | 型 | 説明 |
|--------|------|------|
| id | TEXT (PK) | Better Auth管理のユーザーID |
| role | TEXT NOT NULL DEFAULT 'user' | ユーザーロール ('admin' \| 'user') |

※ Better Authが自動生成するカラム (email, name, etc.) は省略。

## 認証・認可

### 認証方式

- **OIDC (OpenID Connect)** を使用し、外部プロバイダーによるログインを提供
- Better AuthのSocial Providerプラグインで複数プロバイダーに対応
- 対応プロバイダー: Google, GitHub 等（設定で追加可能）
- パスワード認証は提供しない（OIDCのみ）

### admin登録

- **初回ユーザー自動昇格**: 最初にOIDCログインしたユーザーを自動的にadminとする
- **環境変数による追加指定**: `ADMIN_EMAILS` 環境変数にカンマ区切りでメールアドレスを設定し、該当ユーザーのログイン時にadminへ昇格
- 既存adminによるロール変更はユーザー管理APIからも可能

### ロール

| ロール | 説明 |
|--------|------|
| admin | 全操作が可能。ユーザー管理、全ノードの編集・削除 |
| user | 閲覧は全ノード可能。編集・削除は自分が作成したノードのみ |

### 権限マトリクス

| 操作 | admin | user |
|------|-------|------|
| ノード閲覧 | ○ | ○ |
| ノード作成 | ○ | ○ |
| 自分のノード編集 | ○ | ○ |
| 他人のノード編集 | ○ | × |
| ノード削除 | ○ | ×（自分のノードのみ○） |
| タグ管理 | ○ | ○ |
| ユーザー管理 | ○ | × |

## ビュー

### 1. グラフビュー（メイン）

ノード間の親子関係を視覚的に表示するビュー。

- ノードをグラフとして描画し、親子関係をエッジで表現
- **グルーピング**: 特定の親ノードの子ノード集合、または特定のタグを持つノード集合をひとまとまりとして表示
- ノードのクリックで詳細パネルを表示

### 2. 時系列ビュー

ノードを時間軸に沿って表示するビュー。

- 作成日時・更新日時を基準にノードを時系列で並べる
- **グルーピング**: 親ノード単位またはタグ単位でノードをまとめて表示
- フィルタリング: 期間、タグ、親ノードでの絞り込み

### 3. アーティクルビュー

ノードのコンテンツを記事形式で表示するビュー。

- Markdownコンテンツをレンダリングして表示
- ノードの階層構造を目次として利用可能

## API設計 (概要)

ベースパス: `/api`

### ノード

| メソッド | パス | 説明 |
|----------|------|------|
| GET | /nodes | ノード一覧取得 (フィルタ: parent_id, tag, 期間) |
| GET | /nodes/:id | ノード詳細取得 |
| GET | /nodes/:id/children | 子ノード一覧取得 |
| POST | /nodes | ノード作成 |
| PUT | /nodes/:id | ノード更新 |
| DELETE | /nodes/:id | ノード削除 |

### タグ

| メソッド | パス | 説明 |
|----------|------|------|
| GET | /tags | タグ一覧取得 |
| POST | /tags | タグ作成 |
| DELETE | /tags/:id | タグ削除 |
| POST | /nodes/:id/tags | ノードにタグを付与 |
| DELETE | /nodes/:id/tags/:tagId | ノードからタグを削除 |

### 認証 (OIDC)

Better Authが提供するエンドポイントを利用。

| メソッド | パス | 説明 |
|----------|------|------|
| GET | /auth/sign-in/:provider | OIDCプロバイダーへリダイレクト |
| GET | /auth/callback/:provider | OIDCコールバック |
| POST | /auth/sign-out | ログアウト |
| GET | /auth/session | 現在のセッション情報取得 |

### ユーザー管理 (admin)

| メソッド | パス | 説明 |
|----------|------|------|
| GET | /admin/users | ユーザー一覧取得 |
| PUT | /admin/users/:id/role | ユーザーロール変更 |
