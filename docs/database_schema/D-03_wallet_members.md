# D-03: wallet_members テーブル定義

家計簿とユーザーの関連（メンバーシップ）を管理するテーブルです。ユーザーが家計簿に参加している状態や役割を管理します。

## テーブル仕様

| 項目           | 値                 |
| -------------- | ------------------ |
| 物理テーブル名 | wallet_members     |
| 論理テーブル名 | 家計簿メンバー     |
| 主キー         | id                 |
| 外部キー       | user_id, wallet_id |
| 期待レコード数 | 数十〜数百         |

## カラム定義

| 物理名     | 論理名           | データ型    | 必須 | デフォルト値       | 説明                                                   |
| ---------- | ---------------- | ----------- | ---- | ------------------ | ------------------------------------------------------ |
| id         | メンバーシップID | uuid        | Yes  | uuid_generate_v4() | プライマリキー                                         |
| user_id    | ユーザーID       | uuid        | Yes  | なし               | D-01: users(public.users)テーブルの外部キー            |
| wallet_id  | 家計簿ID         | uuid        | Yes  | なし               | walletsテーブルの外部キー                              |
| role       | ロール           | varchar(20) | Yes  | 'general'          | 'admin'（管理ユーザー）または'general'（一般ユーザー） |
| created_at | 作成日時         | timestamp   | Yes  | CURRENT_TIMESTAMP  | レコード作成日時                                       |
| updated_at | 更新日時         | timestamp   | Yes  | CURRENT_TIMESTAMP  | レコード更新日時                                       |

## インデックス

| インデックス名                 | カラム             | 種類        | 説明                                       |
| ------------------------------ | ------------------ | ----------- | ------------------------------------------ |
| wallet_members_pkey            | id                 | PRIMARY KEY | プライマリキー                             |
| wallet_members_user_wallet_idx | user_id, wallet_id | UNIQUE      | ユーザーと家計簿の組み合わせの一意性を保証 |
| wallet_members_user_id_idx     | user_id            | INDEX       | ユーザーIDによる検索を高速化               |
| wallet_members_wallet_id_idx   | wallet_id          | INDEX       | 家計簿IDによる検索を高速化                 |

## 制約

- 一人のユーザーは一つの家計簿につき一つのメンバーシップのみ持つことができる
- roleは'admin'または'general'のいずれかの値のみを取る（アプリケーション層でチェック）
- 外部キー制約：user_id はD-01: users(public.users)テーブルの存在するidを参照
- 外部キー制約：wallet_id はwalletsテーブルの存在するidを参照

## 行レベルセキュリティ (RLS) ポリシー

- **SELECT (閲覧 - 自身のメンバーシップ):** 認証ユーザーは自身のメンバーシップ情報のみを閲覧できる。
  ```sql
  (auth.uid() = user_id)
  ```
- **SELECT (閲覧 - ウォレット管理者):** ウォレットの作成者 (wallets.created_by_user_id が認証ユーザーのIDと一致) は、そのウォレットの全てのメンバー情報を閲覧できる。
  ```sql
  EXISTS (
    SELECT 1
    FROM wallets w
    WHERE (
      w.id = wallet_members.wallet_id AND
      w.created_by_user_id = auth.uid()
    )
  )
  ```
- **INSERT (作成):** 認証されたユーザーは、特定の条件下（例：家計簿作成時、招待承認時など、アプリケーションロジックで制御）でメンバーシップを作成できる。
- **UPDATE (更新):** メンバー自身が自身のロールを更新できる (例: 'general' のみ)、またはウォレット管理者がメンバーのロールを更新できる (推奨)。
  - 自身の更新 (例: role の変更は制限されるべき): `(auth.uid() = user_id)`
  - 管理者による更新: 
    ```sql
    EXISTS (
      SELECT 1
      FROM wallets w
      WHERE (
        w.id = wallet_members.wallet_id AND
        w.created_by_user_id = auth.uid()
      )
    )
    ```
- **DELETE (削除):** メンバー自身が脱退できる、またはウォレット管理者がメンバーを削除できる (推奨)。
  - 自身の削除: `(auth.uid() = user_id)`
  - 管理者による削除:
    ```sql
    EXISTS (
      SELECT 1
      FROM wallets w
      WHERE (
        w.id = wallet_members.wallet_id AND
        w.created_by_user_id = auth.uid()
      )
    )
    ```

## 関連テーブル

- users: メンバーの基本情報 (D-01: users(public.users)を参照)
- wallets: 参加している家計簿の情報
