# D-07: calculation_settings テーブル定義

支払額の算出方法に関する設定を管理するテーブルです。算出方法（収入割合方式/残金均一方式）、支払率調整値、切上げ桁、収入参照月などの設定を含みます。

## テーブル仕様

| 項目           | 値                   |
| -------------- | -------------------- |
| 物理テーブル名 | calculation_settings |
| 論理テーブル名 | 支払額算出設定       |
| 主キー         | id                   |
| 外部キー       | wallet_id            |
| 期待レコード数 | 数十〜数百           |

## カラム定義

| 物理名             | 論理名     | データ型    | 必須 | デフォルト値       | 説明                                                                |
| ------------------ | ---------- | ----------- | ---- | ------------------ | ------------------------------------------------------------------- |
| id                 | 設定ID     | uuid        | Yes  | uuid_generate_v4() | プライマリキー                                                      |
| wallet_id          | 家計簿ID   | uuid        | Yes  | なし               | 設定が属する家計簿ID（walletsテーブルの外部キー）                   |
| calculation_method | 算出方法   | varchar(30) | Yes  | 'income_ratio'     | 'income_ratio'（収入割合方式）または'equal_balance'（残金均一方式） |
| reference_month    | 収入参照月 | varchar(10) | Yes  | 'current'          | 'previous'（前月）または'current'（今月）                           |
| rounding_digit     | 切上げ桁   | integer     | Yes  | 1                  | 支払額計算時の切上げ桁（1=1円、10=10円、100=100円など）             |
| created_at         | 作成日時   | timestamp   | Yes  | CURRENT_TIMESTAMP  | レコード作成日時                                                    |
| updated_at         | 更新日時   | timestamp   | Yes  | CURRENT_TIMESTAMP  | レコード更新日時                                                    |

## インデックス

| インデックス名                  | カラム    | 種類        | 説明                         |
| ------------------------------- | --------- | ----------- | ---------------------------- |
| calculation_settings_pkey       | id        | PRIMARY KEY | プライマリキー               |
| calculation_settings_wallet_idx | wallet_id | UNIQUE      | 家計簿IDによる一意検索を保証 |

## 制約

- 一つの家計簿につき一つの支払額算出設定のみ持つことができる
- calculation_methodは'income_ratio'または'equal_balance'のいずれかの値のみを取る（アプリケーション層でチェック）
- reference_monthは'previous'または'current'のいずれかの値のみを取る（アプリケーション層でチェック）
- rounding_digitは正の整数値のみを取る（1, 10, 100など）
- 外部キー制約：wallet_id はwalletsテーブルの存在するidを参照

## 関連テーブル

- wallets: 設定が属する家計簿情報

## サブテーブル：payment_rate_adjustments (D-08)

家計簿ごとのユーザー別支払率調整値を管理するテーブルです。計算方法から自動算出される支払率を調整するための値を保持します。

### テーブル仕様

| 項目           | 値                              |
| -------------- | ------------------------------- |
| 物理テーブル名 | payment_rate_adjustments        |
| 論理テーブル名 | 支払率調整値                    |
| 主キー         | id                              |
| 外部キー       | calculation_setting_id, user_id |
| 期待レコード数 | 数十〜数百                      |

### カラム定義

| 物理名                 | 論理名           | データ型     | 必須 | デフォルト値       | 説明                                            |
| ---------------------- | ---------------- | ------------ | ---- | ------------------ | ----------------------------------------------- |
| id                     | 調整値ID         | uuid         | Yes  | uuid_generate_v4() | プライマリキー                                  |
| calculation_setting_id | 支払額算出設定ID | uuid         | Yes  | なし               | calculation_settingsテーブルの外部キー          |
| user_id                | ユーザーID       | uuid         | Yes  | なし               | 調整対象のユーザーID（usersテーブルの外部キー） |
| adjustment_percentage  | 調整率（％）     | decimal(5,2) | Yes  | 0                  | 支払率の調整値（％単位、-100〜100の値）         |
| created_at             | 作成日時         | timestamp    | Yes  | CURRENT_TIMESTAMP  | レコード作成日時                                |
| updated_at             | 更新日時         | timestamp    | Yes  | CURRENT_TIMESTAMP  | レコード更新日時                                |

### インデックス

| インデックス名                            | カラム                          | 種類        | 説明                                     |
| ----------------------------------------- | ------------------------------- | ----------- | ---------------------------------------- |
| payment_rate_adjustments_pkey             | id                              | PRIMARY KEY | プライマリキー                           |
| payment_rate_adjustments_setting_user_idx | calculation_setting_id, user_id | UNIQUE      | 設定とユーザーの組み合わせの一意性を保証 |

### 制約

- 同一の支払額算出設定内でユーザーごとに一つの調整値のみ持つことができる
- adjustment_percentageは-100〜100の範囲内の値でなければならない
- 外部キー制約：calculation_setting_id はcalculation_settingsテーブルの存在するidを参照
- 外部キー制約：user_id はusersテーブルの存在するidを参照
