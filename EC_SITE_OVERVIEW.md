# ECサイト概要資料

この資料は、現在のコードベースから確認できる EC サイトの構成、利用者別の流れ、主要機能、技術スタックをまとめたものです。

## 1. サイトの目的

本プロジェクトは、一般ユーザー向けの商品閲覧・購入と、管理者向けの商品管理を行う EC サイトの MVP を構築しているものです。

- 一般ユーザー: 商品一覧の閲覧、カテゴリ検索、商品詳細、カート操作
- 管理者: 商品の登録・更新・削除、カテゴリ管理
- 認証: メールアドレスとパスワードによるログイン
- 認可: JWT を Cookie に保存し、ログイン状態を検証

## 2. 画面構成

### 2-1. 認証関連

- `/` で開始し、ログイン画面へリダイレクト
- `/login`: 一般ユーザー向けログイン
- `/login/admin`: 管理者ログイン
- `/signup`: 会員登録

実装上は `src/app/features/auth/components/login-form.tsx` と `signup-from.tsx` にフォームがあり、ログイン時に `loginAction` が実行されます。管理者ログインは「ロゴを5回連続クリック」で `/login/admin` に遷移する隠し導線があります。

### 2-2. 一般ユーザー向け

- `/products/list`: 商品一覧画面
- `/products/list/[id]`: 商品詳細画面
- `/cart`: カート詳細画面

ユーザーは認証済みでないと `redirect("/login")` されます。管理者アカウントでログインした場合は `/dashboard` へ案内されます。

### 2-3. 管理者向け

- `/dashboard`: 管理者ダッシュボード
- `/products/management`: 商品管理画面
- `/products/management/[id]`: 商品の更新画面

管理者ログイン時は `admin: true` を持つユーザーとして扱われ、通常ユーザーのトップ画面に行けません。

## 3. 主な機能

### 3-1. 商品一覧・検索

`src/app/features/products/components/list/list-form.tsx` では以下を実装しています。

- 商品名で検索
- カテゴリで絞り込み
- ページネーション
- 商品カード表示
- 「カートに入れる」ボタン

`getProducts(search, page)` で Prisma を使って検索と件数取得を行い、ページ数を算出しています。

### 3-2. 商品詳細

`src/app/products/list/[id]/page.tsx` と `src/app/features/products/components/list/details-form.tsx` により、

- 商品名
- 価格
- 在庫数
- 説明
- カテゴリ
- 画像・情報表示

を確認できる構成になっています。詳細画面からもカートに入れる流れが想定されています。

### 3-3. カート

`src/app/features/carts/components/cart-form.tsx` により、

- 商品一覧からカートに追加
- 数量と小計を計算
- 送料の計算
- 合計金額表示
- 商品の削除
- 購入ボタン（現状は UI 上のボタン）

が実装されています。

`cartUpsert` や `deleteCartItem` により、Cart モデルと CartItems モデルを更新します。

### 3-4. 管理者商品管理

`src/app/features/products/components/management/management-form.tsx` では、

- 商品検索
- 一覧表示
- 商品登録シート
- 商品更新
- 商品削除
- ページネーション

を扱っています。商品登録時には既存商品・カテゴリ重複チェック、Zod による入力バリデーションが実装されています。

### 3-5. 認証とユーザー権限

`src/lib/auth.ts` の `getCurrentUser()` は以下の流れで認証します。

- Cookie の `auth_token` を確認
- JWT を `jose` の `jwtVerify` で検証
- `id`, `username`, `admin` を取得
- 認証失敗時は `null` を返す

この仕組みにより、画面で `user` が存在しない場合はログイン画面へ強制遷移します。一般ユーザーと管理者を分岐しているのが特徴です。

## 4. データモデル

Prisma の `prisma/schema.prisma` には、以下の主要モデルがあります。

- `users`: ユーザー情報
- `address`: 配送先住所
- `products`: 商品情報
- `category`: 商品カテゴリ
- `product_images`: 商品画像
- `cart`: ユーザーごとのカート
- `cart_items`: カート内の商品と数量
- `order`: 注文のヘッダ
- `order_items`: 注文に紐づく商品明細

### 主要なポイント

- `users` は `admin` フラグを持ち、ユーザーと管理者を区別
- `products` は `categoryId` でカテゴリに紐づく
- `cart` は `user_id` に対して 1 件のみ存在
- `cart_items` は `(cart_id, product_id)` の組みで重複禁止
- `order_status` は `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELED`

## 5. 技術構成

### フロントエンド

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

### バックエンド/データ層

- Prisma
- PostgreSQL
- JWT (jose / jsonwebtoken)
- bcrypt
- Supabase の導入も見られるが、実装上の中心は Prisma/PostgreSQL

### 主要な実装ファイル

- `src/app/...`: 画面とページ
- `src/app/features/...`: 機能ごとの UI とアクション
- `src/lib/auth.ts`: 認証
- `src/lib/prisma.ts`: Prisma クライアント
- `src/lib/prisma/query.ts`: Prisma クエリ統合
- `src/types/types.ts`: 型定義

## 6. 利用者別のユーザーフロー

### 一般ユーザーの流れ

1. ログイン
2. 商品一覧画面へ遷移
3. 検索やカテゴリ絞り込みで商品を抽出
4. 商品詳細で価格や説明を確認
5. カートへ追加
6. カート画面で金額確認
7. 購入ボタンで購入処理へ進行する前提

### 管理者の流れ

1. 管理者ログイン
2. ダッシュボードへ遷移
3. 商品管理画面で商品一覧・検索
4. 新規商品登録または更新
5. 在庫とカテゴリを管理

## 7. 現状の整理ポイント

現時点のコードを見ると、EC サイトとしての主要機能はほぼ揃っており、特に以下が中心になっています。

- 認証付きの EC 画面
- カテゴリ・商品検索
- カート処理
- 管理者の商品管理
- Prisma を使ったデータ設計

一方で、以下のような改善余地もあります。

- 購入処理の実装完了
- 決済連携
- 配送先住所管理の保存・更新フロー
- 商品画像アップロードの実装
- 注文履歴画面
- 管理者ダッシュボードの集計表示

## 8. まとめ

この EC サイトは、一般ユーザー向けの「商品閲覧・購入体験」と、管理者向けの「商品管理機能」を持つ、実務レベルの小規模 EC アプリとして整理できます。

特に、Next.js App Router + Prisma + PostgreSQL ベースで構成されており、個人開発の実験プロジェクトとしては十分に実用的な骨格を持っています。

この資料をベースに、さらに以下の観点を追加すると、より社内向け・提案書向けの資料に近づきます。

- 画面遷移図
- 機能一覧表
- ユーザー像（ペルソナ）
- MVP と将来拡張の整理
- 実装優先順位
