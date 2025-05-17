# D-02: wallets テーブル定義

家計簿の基本情報を管理するテーブルです。名称、参加コード、参加申請受付設定などを含みます。

## テーブル仕様

| 項目           | 値         |
| -------------- | ---------- |
| 物理テーブル名 | wallets    |
| 論理テーブル名 | 家計簿     |
| 主キー         | id         |
| 外部キー       | なし       |
| 期待レコード数 | 数十〜数百 |

## カラム定義

| 物理名               | 論理名             | データ型     | 必須 | デフォルト値       | 説明                                                                  |
| -------------------- | ------------------ | ------------ | ---- | ------------------ | --------------------------------------------------------------------- |
| id                   | 家計簿ID           | uuid         | Yes  | uuid_generate_v4() | プライマリキー                                                        |
| name                 | 家計簿名           | varchar(100) | Yes  | なし               | 家計簿の名称                                                          |
| accept_join_requests | 参加申請受付       | boolean      | Yes  | true               | 参加申請を受け付けるか（true/false）                                  |
| join_code            | 参加コード         | varchar(12)  | No   | なし               | 家計簿への参加に必要なコード、accept_join_requestsがtrueの場合に必要  |
| is_join_code_auto    | 参加コード自動生成 | boolean      | Yes  | true               | 参加コードが自動生成されたか（true）、手動入力か（false）             |
| created_by_user_id   | 作成者             | uuid         | Yes  | なし               | この家計簿レコードを最初に作成したユーザーのID (auth.users.id を参照) |
| created_at           | 作成日時           | timestamp    | Yes  | CURRENT_TIMESTAMP  | レコード作成日時                                                      |
| updated_at           | 更新日時           | timestamp    | Yes  | CURRENT_TIMESTAMP  | レコード更新日時                                                      |

## インデックス

| インデックス名        | カラム    | 種類        | 説明                     |
| --------------------- | --------- | ----------- | ------------------------ |
| wallets_pkey          | id        | PRIMARY KEY | プライマリキー           |
| wallets_join_code_key | join_code | UNIQUE      | 参加コードの一意性を保証 |

## 制約

- 参加コードは一意であること
- 参加コードは英数字6〜12文字であること（アプリケーション層でチェック）
- 外部キー制約: created_by_user_id は auth.users(id) を参照すること。

## 行レベルセキュリティ (RLS) ポリシー

- **SELECT (閲覧):** ウォレットの作成者 (wallets.created_by_user_id が認証ユーザーのIDと一致) のみが、そのウォレットの情報を閲覧できる。
  ```sql
  (created_by_user_id = auth.uid())
  ```
- **INSERT (作成):** 認証されたユーザーは新しいウォレットを作成できる (通常、アプリケーションロジックで制御)。
- **UPDATE (更新):** ウォレットの作成者のみがウォレット情報を更新できる (推奨)。
  ```sql
  (created_by_user_id = auth.uid())
  ```
- **DELETE (削除):** ウォレットの作成者のみがウォレットを削除できる (推奨)。
  ```sql
  (created_by_user_id = auth.uid())
  ```

## 関連テーブル

- wallet_members: 家計簿とユーザーの関連を管理
- wallet_join_requests: 家計簿への参加申請を管理
- income_expenses: 家計簿の収支情報を管理
- payment_destinations: 家計簿の支払先を管理
- calculation_settings: 家計簿の支払額算出設定を管理
