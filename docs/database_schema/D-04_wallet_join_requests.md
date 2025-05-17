# D-04: wallet_join_requests テーブル定義

家計簿への参加申請を管理するテーブルです。申請中、承認済み、却下などの状態を管理します。

## テーブル仕様

| 項目           | 値                   |
| -------------- | -------------------- |
| 物理テーブル名 | wallet_join_requests |
| 論理テーブル名 | 家計簿参加申請       |
| 主キー         | id                   |
| 外部キー       | user_id, wallet_id   |
| 期待レコード数 | 数十〜数百           |

## カラム定義

| 物理名       | 論理名             | データ型    | 必須 | デフォルト値       | 説明                                                                                  |
| ------------ | ------------------ | ----------- | ---- | ------------------ | ------------------------------------------------------------------------------------- |
| id           | 申請ID             | uuid        | Yes  | uuid_generate_v4() | プライマリキー                                                                        |
| user_id      | ユーザーID         | uuid        | Yes  | なし               | 申請を出したユーザーのID（D-01: users(public.users)テーブルの外部キー）               |
| wallet_id    | 家計簿ID           | uuid        | Yes  | なし               | 申請先の家計簿ID（walletsテーブルの外部キー）                                         |
| status       | 申請状態           | varchar(20) | Yes  | 'pending'          | 'pending'（申請中）、'approved'（承認済み）、'rejected'（却下）                       |
| join_code    | 使用した参加コード | varchar(12) | Yes  | なし               | 申請時に使用した参加コード                                                            |
| processed_by | 処理ユーザーID     | uuid        | No   | null               | 申請を処理（承認/却下）したユーザーのID (D-01: users(public.users)テーブルの外部キー) |
| processed_at | 処理日時           | timestamp   | No   | null               | 申請が処理された日時                                                                  |
| created_at   | 作成日時           | timestamp   | Yes  | CURRENT_TIMESTAMP  | レコード作成日時                                                                      |
| updated_at   | 更新日時           | timestamp   | Yes  | CURRENT_TIMESTAMP  | レコード更新日時                                                                      |

## インデックス

| インデックス名                       | カラム             | 種類        | 説明                                       |
| ------------------------------------ | ------------------ | ----------- | ------------------------------------------ |
| wallet_join_requests_pkey            | id                 | PRIMARY KEY | プライマリキー                             |
| wallet_join_requests_user_wallet_idx | user_id, wallet_id | UNIQUE      | ユーザーと家計簿の組み合わせの一意性を保証 |
| wallet_join_requests_user_id_idx     | user_id            | INDEX       | ユーザーIDによる検索を高速化               |
| wallet_join_requests_wallet_id_idx   | wallet_id          | INDEX       | 家計簿IDによる検索を高速化                 |
| wallet_join_requests_status_idx      | status             | INDEX       | 申請状態による検索を高速化                 |

## 制約

- 一人のユーザーは一つの家計簿につき一度だけ申請できる（重複申請は禁止）
- statusは'pending'、'approved'、'rejected'のいずれかの値のみを取る（アプリケーション層でチェック）
- 外部キー制約：user_id はD-01: users(public.users)テーブルの存在するidを参照
- 外部キー制約：wallet_id はwalletsテーブルの存在するidを参照
- 外部キー制約：processed_by がnullでない場合、D-01: users(public.users)テーブルの存在するidを参照

## 行レベルセキュリティ (RLS) ポリシー

- **SELECT (閲覧 - 自身の申請):** 認証ユーザーは自身の参加申請のみを閲覧できる。
  ```sql
  (auth.uid() = user_id)
  ```
- **SELECT (閲覧 - ウォレット管理者):** ウォレットの作成者 (wallets.created_by_user_id が認証ユーザーのIDと一致) は、そのウォレットへの全ての参加申請を閲覧できる。
  ```sql
  EXISTS (
    SELECT 1
    FROM wallets w
    WHERE (
      w.id = wallet_join_requests.wallet_id AND
      w.created_by_user_id = auth.uid()
    )
  )
  ```
- **INSERT (作成):** 認証されたユーザーは新しい参加申請を作成できる。
  ```sql
  (auth.uid() = user_id) -- 基本的な制約、さらにアプリケーション側で参加コードの検証などが必要
  ```
- **UPDATE (更新 - ウォレット管理者):** ウォレットの作成者のみが参加申請のステータスを更新（承認/却下）できる。
  - `USING` 句 (どの行を更新できるか):
    ```sql
    EXISTS (
      SELECT 1
      FROM wallets w
      WHERE (
        w.id = wallet_join_requests.wallet_id AND
        w.created_by_user_id = auth.uid()
      )
    )
    ```
  - `WITH CHECK` 句 (更新後の行が満たすべき条件):
    ```sql
    EXISTS (
      SELECT 1
      FROM wallets w
      WHERE (
        w.id = wallet_join_requests.wallet_id AND
        w.created_by_user_id = auth.uid()
      )
    ) AND (processed_by = auth.uid()) -- 処理者が認証ユーザーであることを保証
    ```
- **DELETE (削除):** 通常、参加申請は削除せずステータスで管理する。もし削除を許可する場合、申請者本人またはウォレット管理者に制限することが考えられる。

## 関連テーブル

- users: 申請者の情報と処理者の情報 (D-01: users(public.users)を参照)
- wallets: 申請先の家計簿情報
