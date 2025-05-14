# D-06: payment_destinations テーブル定義

支払先の情報を管理するテーブルです。家計簿ごとの支払先名称、支払日（固定日または月末）などを含みます。

## テーブル仕様

| 項目           | 値                   |
| -------------- | -------------------- |
| 物理テーブル名 | payment_destinations |
| 論理テーブル名 | 支払先               |
| 主キー         | id                   |
| 外部キー       | wallet_id            |
| 期待レコード数 | 数十〜数百           |

## カラム定義

| 物理名           | 論理名       | データ型     | 必須 | デフォルト値       | 説明                                                           |
| ---------------- | ------------ | ------------ | ---- | ------------------ | -------------------------------------------------------------- |
| id               | 支払先ID     | uuid         | Yes  | uuid_generate_v4() | プライマリキー                                                 |
| wallet_id        | 家計簿ID     | uuid         | Yes  | なし               | 支払先が属する家計簿ID（walletsテーブルの外部キー）            |
| name             | 支払先名称   | varchar(100) | Yes  | なし               | 支払先の名称（例：家賃、電気代、ガス代）                       |
| payment_due_type | 支払日タイプ | varchar(20)  | Yes  | 'fixed_day'        | 'fixed_day'（固定日）または'last_day'（月末最終日）            |
| payment_due_day  | 支払日（日） | integer      | No   | null               | 支払日（1〜31の値）、payment_due_typeが'fixed_day'の場合に必須 |
| created_at       | 作成日時     | timestamp    | Yes  | CURRENT_TIMESTAMP  | レコード作成日時                                               |
| updated_at       | 更新日時     | timestamp    | Yes  | CURRENT_TIMESTAMP  | レコード更新日時                                               |

## インデックス

| インデックス名                  | カラム          | 種類        | 説明                                 |
| ------------------------------- | --------------- | ----------- | ------------------------------------ |
| payment_destinations_pkey       | id              | PRIMARY KEY | プライマリキー                       |
| payment_destinations_wallet_idx | wallet_id       | INDEX       | 家計簿IDによる検索を高速化           |
| payment_destinations_name_idx   | wallet_id, name | UNIQUE      | 家計簿内での支払先名称の一意性を保証 |

## 制約

- 同一家計簿内で支払先名称は重複できない
- payment_due_typeは'fixed_day'または'last_day'のいずれかの値のみを取る（アプリケーション層でチェック）
- payment_due_typeが'fixed_day'の場合、payment_due_dayは1〜31の範囲内の値でなければならない
- payment_due_typeが'last_day'の場合、payment_due_dayはnullでなければならない
- 外部キー制約：wallet_id はwalletsテーブルの存在するidを参照

## 関連テーブル

- wallets: 支払先が属する家計簿情報

## 備考

- 支払先情報は、月ごとの家計簿表示時に支払期限の算出に使用される
- 固定日の場合、毎月その日が支払日となる（31日の場合、2月は最終日になるなど月の日数に応じて調整）
- 月末最終日の場合、毎月の最終日が支払日となる
