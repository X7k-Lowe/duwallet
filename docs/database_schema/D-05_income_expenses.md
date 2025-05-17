# D-05: income_expenses テーブル定義

各家計簿の収支情報を管理するテーブルです。ユーザー別の収支と共通収支の両方を含み、日付、金額、説明、自動追加設定などの情報を保持します。

## テーブル仕様

| 項目           | 値                 |
| -------------- | ------------------ |
| 物理テーブル名 | income_expenses    |
| 論理テーブル名 | 収支情報           |
| 主キー         | id                 |
| 外部キー       | wallet_id, user_id |
| 期待レコード数 | 数百〜数千         |

## カラム定義

| 物理名           | 論理名           | データ型      | 必須 | デフォルト値       | 説明                                                                                |
| ---------------- | ---------------- | ------------- | ---- | ------------------ | ----------------------------------------------------------------------------------- |
| id               | 収支ID           | uuid          | Yes  | uuid_generate_v4() | プライマリキー                                                                      |
| wallet_id        | 家計簿ID         | uuid          | Yes  | なし               | 収支が属する家計簿ID（walletsテーブルの外部キー）                                   |
| user_id          | ユーザーID       | uuid          | No   | null               | 収支の所有者ID（D-01: users(public.users)テーブルの外部キー）、共通収支の場合はnull |
| is_common        | 共通収支フラグ   | boolean       | Yes  | false              | 共通収支か（true）、ユーザー個別収支か（false）                                     |
| is_income        | 収入フラグ       | boolean       | Yes  | true               | 収入か（true）、支出か（false）                                                     |
| amount           | 金額             | decimal(12,2) | Yes  | 0                  | 収支金額                                                                            |
| description      | 説明             | varchar(255)  | Yes  | なし               | 収支の説明（項目名）                                                                |
| transaction_date | 収支日           | date          | Yes  | CURRENT_DATE       | 収支が発生した日付                                                                  |
| year_month       | 年月             | varchar(7)    | Yes  | なし               | 収支の年月（YYYY-MM形式）                                                           |
| auto_add_next    | 次月以降自動追加 | boolean       | Yes  | false              | 次月以降も自動的に追加するか                                                        |
| created_at       | 作成日時         | timestamp     | Yes  | CURRENT_TIMESTAMP  | レコード作成日時                                                                    |
| updated_at       | 更新日時         | timestamp     | Yes  | CURRENT_TIMESTAMP  | レコード更新日時                                                                    |

## インデックス

| インデックス名                 | カラム                | 種類        | 説明                           |
| ------------------------------ | --------------------- | ----------- | ------------------------------ |
| income_expenses_pkey           | id                    | PRIMARY KEY | プライマリキー                 |
| income_expenses_wallet_idx     | wallet_id             | INDEX       | 家計簿IDによる検索を高速化     |
| income_expenses_user_idx       | user_id               | INDEX       | ユーザーIDによる検索を高速化   |
| income_expenses_year_month_idx | wallet_id, year_month | INDEX       | 家計簿と年月による検索を高速化 |
| income_expenses_date_idx       | transaction_date      | INDEX       | 日付による検索を高速化         |

## 制約

- 共通収支の場合（is_common = true）、user_idはnullでなければならない
- ユーザー個別収支の場合（is_common = false）、user_idはnullではありえない
- 金額は0以上の数値でなければならない
- 外部キー制約：wallet_id はwalletsテーブルの存在するidを参照
- 外部キー制約：user_id がnullでない場合、D-01: users(public.users)テーブルの存在するidを参照

## 関連テーブル

- wallets: 収支が属する家計簿情報
- users: 収支の所有者情報（ユーザー個別収支の場合、D-01: users(public.users)を参照）

## 備考

- 収支の年月（year_month）は、検索や集計効率化のために正規化せずにカラムとして持つ
- 年月ごとの家計簿データ表示の際に、このテーブルから対象年月のデータを取得する
- 月次に家計簿データを自動作成する場合、auto_add_nextフラグがtrueの収支をコピーして作成する
