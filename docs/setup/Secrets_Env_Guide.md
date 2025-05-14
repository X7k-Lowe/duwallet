 # 秘密情報・環境変数設定ガイド

本書では **duwallet** を動作させるために必要な API キー／トークン類の取得方法と `.env*` への配置方法をまとめます。

---
## 1. Supabase

| 変数名 | 取得元 | 手順 |
|---------|-------|------|
| `SUPABASE_URL` | Supabase プロジェクト > Settings > Project Settings | `https://<project-ref>.supabase.co` 形式の REST URL |
| `SUPABASE_ANON_KEY` | 同上 > API | `anon` もしくは `public` と表示されるキーをコピー |
| `SUPABASE_SERVICE_ROLE_KEY` | **開発環境のみ**。同画面で `service_role` キー取得。サーバー専用（絶対にクライアントに公開しない） |
| `SUPABASE_JWT_SECRET` | Settings > Auth > JWT | 主に Edge Functions 検証用。 | 

> **セキュリティ**: `SERVICE_ROLE_KEY` と `JWT_SECRET` は Vercel の「Environment Variables (Encrypted)」に **Production Only** で設定し、Git には絶対に含めないでください。

---
## 2. GitHub (CI/CD)

| 変数名 | 用途 | 設定箇所 |
|---------|------|----------|
| `GITHUB_TOKEN` | GitHub Actions で自リポジトリへ push ／ releases を行う際に自動で付与されるため **手動設定不要** | GitHub Actions 内部 |
| `VERCEL_TOKEN` | Actions から Vercel デプロイ API を叩く場合 | Vercel Personal Settings > Tokens |

### Vercel の環境変数マッピング例

| Scope | Name | Value |
|-------|------|-------|
| All Environments | NEXT_PUBLIC_SUPABASE_URL | `${SUPABASE_URL}` |
| All Environments | NEXT_PUBLIC_SUPABASE_ANON_KEY | `${SUPABASE_ANON_KEY}` |
| Production       | SUPABASE_SERVICE_ROLE_KEY | `${SUPABASE_SERVICE_ROLE_KEY}` |

---
## 3. PWA / Web Push (将来導入予定)

| 変数名 | 取得方法 | 備考 |
|---------|--------|------|
| `VAPID_PUBLIC_KEY` | `npx web-push generate-vapid-keys --json` | クライアントへ公開可 |
| `VAPID_PRIVATE_KEY`| 同上 | サーバーのみ |

> **注**: Web Push は無料枠オーバーの要因になりやすいため、現段階では未導入。

---
## 4. `.env*` の運用ルール

1. **共有しない**: `.env.local` は `.gitignore` 済み。ローカル専用。  
2. **テンプレート提供**: `/.env.example` に必須変数を空欄で用意し、値は各自入力。  
3. **階層化**: 
   * `.env.local` …… 開発用 (ローカル DB / localhost Callback URL)  
   * `.env.test` …… CI ユニットテスト用 (Mock 値可)  
   * プロダクション …… Vercel ダッシュボードで管理。
4. **アクセスレベル**: `NEXT_PUBLIC_***` で始まる変数のみブラウザから参照可能。  

---
## 5. 参考コマンド

```bash
# Supabase 用キーを安全に貼り付け (Mac)
printf "SUPABASE_URL=...\nSUPABASE_ANON_KEY=..." >> .env.local

# Vercel CLI で Production 用に登録
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

以上で秘密情報の管理準備は完了です。