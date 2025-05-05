# duwallet

割勘計算機能を備えた共通家計簿 Web アプリ（モバイルファースト PWA）

---

## 1. プロダクト概要

`duwallet` は複数ユーザーが共同で管理する家計簿を、収入割合や残金に応じた独自ロジックで自動割勘し、決済期限も含めて一元管理できる PWA です。主目的は夫婦 2 名での利用ですが、ユーザー数拡張やチーム利用を想定したスケーラビリティも確保します。アプリ名は *duet / duo* + *wallet* に由来します。

## 2. アーキテクチャ概要

```mermaid
flowchart TD
  subgraph Client (Next.js PWA)
    A1[React 18 + TypeScript]
    A2[TanStack Query]
    A3[Zustand]
    A4[Service Worker]
    A1 --> A2 --> A3 --> A4
  end
  subgraph BaaS (Supabase)
    B1[PostgreSQL 15]
    B2[Auth]
    B3[Edge Functions (Deno)]
    B4[Realtime]
    B1 <--> B4
  end
  subgraph DevOps
    C1[GitHub Actions]
    C2[Vercel Hosting]
  end
  A4 --HTTPS / Supabase-js--> B2
  A4 --HTTPS / Supabase-js--> B3
  C1 --> C2
```

## 3. 技術スタック（決定版）

| 層 | 採用技術 | 主な役割 | 採用理由 |
|----|-----------|----------|-----------|
| フロントエンド | **Next.js 14 (App Router)**, **React 18**, **TypeScript** | SPA/PWA | ファイルルーティング + SSG/ISR、Vercel との相性 |
| UI / スタイリング | **Tailwind CSS 3**, **shadcn/ui**, **class-variance-authority** | デザインシステム | 最小 CSS、コンポーネントのカスタマイズ性 |
| 状態管理 | **TanStack Query**, **Zustand** | API キャッシュ / UI 状態 | データ取得の最適化とシンプルなグローバルステート |
| バリデーション | **React Hook Form + Zod** | フォーム & 型安全 | 型定義とスキーマを共有 |
| 日付操作 | **date-fns** | ローカライズ対応 | 軽量、tree-shakable |
| 国際化 | **i18next** | 多言語化 | シンプルかつ実績豊富 |
| PWA | **next-pwa** | キャッシュ戦略／オフライン | 設定が簡易で iOS 対応実績あり |
| 認証 / データベース | **Supabase (PostgreSQL + Auth + Storage + Realtime)** | BaaS | 無料枠が広く、RLS による高いセキュリティ |
| サーバーロジック | **Supabase Edge Functions (TypeScript)** | ビジネスロジック | 無料・Deno 実行環境、低レイテンシ |
| CI / CD | **GitHub Actions**, **Vercel**, **Supabase CLI** | テスト／自動デプロイ | OSS かつ無料枠で完結 |
| テスト | **Jest**, **@testing-library/react**, **Playwright** | 単体／結合／E2E | PWA シナリオも網羅 |
| 品質ツール | **ESLint**, **Prettier**, **Husky**, **lint-staged**, **commitlint** | コードスタイル統一 | DX 向上 |
| 開発環境 | **Docker Compose** | ローカル DB & Edge Functions | Windows でも環境差分無し |

> 💰 **コスト試算**: フロント (Vercel Hobby)、バックエンド (Supabase Free) で月額 $0 運用が可能。

## 4. 非機能要件

| 分類 | 指標 | 目標値 |
|------|------|--------|
| パフォーマンス | LCP | ≤ 2.5 s (3G 回線) |
| レイテンシ | API 往復 | ≤ 150 ms (99 パーセンタイル) |
| オフライン | キャッシュ保持期間 | 12 ヶ月分のトランザクション |
| セキュリティ | RLS 適用率 | 100 % |
| アクセシビリティ | WCAG | 2.1 AA 準拠 |
| 可用性 | フロント SLA | 99.9 % (Vercel) |
| 保守性 | API カバレッジ | 単体テスト 90 % + E2E 30 % |

## 5. 辛口レビュー & 添削ポイント（旧基本設計へのフィードバック）

1. **画面 ID が未付与**
   - 追跡・テストケース作成時に参照が困難。→ 全画面に `A-xx` 形式の ID を付与。
2. **入力バリデーション要件の欠落**
   - フロント／DB 双方でスキーマが曖昧。→ Zod スキーマを単一ソース化。
3. **エラー UX の不在**
   - 失敗時フローが定義されていない。→ トースト + フォームフィードバックを明示。
4. **用語の不統一**
   - 「参加ユーザー」「ユーザー」「メンバー」が混在。→ ドメイン語彙を README で統一。
5. **非機能要件がゼロ**
   - パフォーマンス・セキュリティ指標が未定義。→ [非機能要件] セクションを新設。
6. **権限管理が粗い**
   - RLS 方針やロールレベルの詳細が不足。→ DB 設計 YAML で詳細管理。
7. **オフライン & ネットワーク障害時考慮無し**
   - PWA であるなら必須。→ SW による IndexedDB キャッシュを設計。
8. **月遷移ロジックが UI 側に埋め込み予定**
   - サーバー側で月締め処理を関数化し、バッチ or Edge Function Cron で実行するべき。
9. **通貨・端数処理定義が曖昧**
   - `Intl.NumberFormat` と DB 側 numeric(12,2) で統一。切上げ桁を config にする。
10. **ユースケース図が無い**
    - 開発者以外のステークホルダーが動作を把握しづらい。→ docs/specs 配下に UML を追加。

## 6. 基本設計（改訂版）

以下は上記フィードバックを反映した新版です。表形式で全項目を漏れなく記載しています。

### 6.1 画面一覧

| ID | 画面名 | URL | 主機能 | 権限 | 備考 |
|----|--------|-----|--------|------|------|
| A-01 | スプラッシュ | / | ロゴ表示、認証状態チェック | 全員 | 3 秒表示後、自動遷移 |
| A-02 | ログイン | /login | Email+PW、Biometric | 未認証 | Supabase OTP 対応 |
| A-03 | 新規登録 | /signup | ユーザー登録 | 未認証 | 招待コード入力可 |
| B-01 | 家計簿選択 | /books | 家計簿名一覧取得 | 認証 | 参加 0 件なら作成誘導 |
| B-02 | 家計簿作成 | /books/new | 家計簿登録 | 認証 | 参加コード自動生成 |
| C-01 | ホーム | /books/:bookId | 月次サマリ | 参加者 | 月遷移 UI、Skeleton |
| C-02 | 月次収支登録 | /books/:bookId/entries | 収支 CRUD | 参加者 | RHF + Zod |
| C-03 | 支払先登録 | /books/:bookId/payees | 支払先 CRUD | 管理者 |   |
| C-04 | 算出設定 | /books/:bookId/settings/calc | 支払額ロジック | 管理者 | 動的プレビュー |
| C-05 | 基本設定 | /books/:bookId/settings/basic | 名称・参加コード | 管理者 |   |
| C-06 | 参加ユーザー管理 | /books/:bookId/users | ロール管理 | 管理者 | RLS 越権不可 |
| D-01 | ユーザー設定 | /me | プロフィール編集 | 認証 |   |

### 6.2 ドメインモデル（抜粋）

```mermaid
classDiagram
  class User {
    uuid id PK
    text email
    text name
    enum gender {male,female,other}
    bool multi_book
  }
  class Book {
    uuid id PK
    text name
    text invite_code
    bool receive_request
  }
  class BookUser {
    uuid user_id FK
    uuid book_id FK
    enum role {admin,member}
    bool approved
  }
  User "1" -- "*" BookUser
  Book "1" -- "*" BookUser
```

> DB 詳細は `docs/specs/database_schema.yaml` を参照。

### 6.3 主要ロジック

1. **収入割合方式**  
   `payable = total_due * (user_income / (total_income - shared_income))`
2. **残金均一方式**  
   `payable = user_income - ((total_income - total_expense) / member_count)`
3. **支払率カスタム**  
   ベース率 ± (N-1)% の手動補正。補正分は他メンバーへ等分で相殺。
4. **端数処理**  
   `Math.ceil(value / Math.pow(10, keta)) * Math.pow(10, keta)`

### 6.4 バッチ & クロン

| 処理 | 実行タイミング | 実装 | 備考 |
|------|---------------|------|------|
| 月次データ自動生成 | 月末 23:50 (JST) | Supabase Edge Cron | 翌月 +1 ヶ月分作成 |
| 過去月ロック | 月末処理後 | 同上 | RLS 更新で書込禁止 |

## 7. 実装方針（AI エージェント運用）

1. **docs/specs** 配下に YAML 形式で *仕様・詳細設計・テックスタック・ディレクトリ構成・DB 定義・テスト計画* を分離保存する。  
2. タスクは **docs/tasks/pending** に粒度最小で配置し、完了後 **docs/tasks/done** へ移動。  
3. 依存関係は `task_manager.yaml` で DAG 管理し、直列／並列を明示。  
4. 各セッション開始時に AI エージェントは必ず上記 YAML をパースし、矛盾が無いか検証する。  
5. コード生成後は **CI (GitHub Actions)** で `pnpm test && playwright test --reporter=line` を通過するまでは完了としない。  
6. **省略禁止 / ハルシネーションゼロ** を遵守し、変更差分は明示的に Pull Request で共有する。

---

> 本 README は 2024-06-XX に全面改訂されました。以前の内容は Git 履歴を参照してください。
