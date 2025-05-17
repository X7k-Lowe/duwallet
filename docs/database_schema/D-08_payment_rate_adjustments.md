# D-08: payment_rate_adjustments テーブル定義

計算方法から自動算出される支払率を調整するための値を保持します。calculation_settingsテーブルのサブテーブルとして機能します。

## テーブル仕様

| 項目           | 値                              |
| -------------- | ------------------------------- |
| 物理テーブル名 | payment_rate_adjustments        |
| 論理テーブル名 | 支払率調整値                    |
| 主キー         | id                              |
| 外部キー       | calculation_setting_id, user_id |
| 期待レコード数 | 数十〜数百                      |

## カラム定義

| 物理名                 | 論理名           | データ型     | 必須 | デフォルト値       | 説明                                         |
| ---------------------- | ---------------- | ------------ | ---- | ------------------ | -------------------------------------------- |
| id                     | 調整値ID         | uuid         | Yes  | uuid_generate_v4() | プライマリキー                               |
| calculation_setting_id | 支払額算出設定ID | uuid         | Yes  | なし               | D-07: calculation_settingsテーブルの外部キー |
| user_id                | ユーザーID       | uuid         | Yes  | なし               | D-01: users(public.users)テーブルの外部キー                |
| adjustment_percentage  | 調整率（％）     | decimal(5,2) | Yes  | 0                  | 支払率の調整値（％単位、-100〜100の値）      |
| created_at             | 作成日時         | timestamp    | Yes  | CURRENT_TIMESTAMP  | レコード作成日時                             |
| updated_at             | 更新日時         | timestamp    | Yes  | CURRENT_TIMESTAMP  | レコード更新日時                             |

## インデックス

| インデックス名                            | カラム                          | 種類        | 説明                                     |
| ----------------------------------------- | ------------------------------- | ----------- | ---------------------------------------- |
| payment_rate_adjustments_pkey             | id                              | PRIMARY KEY | プライマリキー                           |
| payment_rate_adjustments_setting_user_idx | calculation_setting_id, user_id | UNIQUE      | 設定とユーザーの組み合わせの一意性を保証 |
| payment_rate_adjustments_setting_idx      | calculation_setting_id          | INDEX       | 設定IDによる検索を高速化                 |
| payment_rate_adjustments_user_idx         | user_id                         | INDEX       | ユーザーIDによる検索を高速化             |

## 制約

- 同一の支払額算出設定内でユーザーごとに一つの調整値のみ持つことができる
- adjustment_percentageは-100〜100の範囲内の値でなければならない
- 外部キー制約：calculation_setting_id はcalculation_settingsテーブルの存在するidを参照
- 外部キー制約：user_id はD-01: users(public.users)テーブルの存在するidを参照

## 関連テーブル

- calculation_settings: この調整値が属する支払額算出設定
- users: この調整値の対象ユーザー (D-01: users(public.users)を参照)

## 備考

- 支払率調整値は、基本支払率から微調整するためのパーセンテージ値
- 算出方法（収入割合方式/残金均一方式）で自動計算される支払率をベースに調整する
- ユーザー間の支払率調整は全体で100%になるように自動的に調整される
