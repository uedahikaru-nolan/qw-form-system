# メール送信設定ガイド

## Resend APIを使用したメール送信（パスワード不要）

このプロジェクトでは、パスワード不要でメール送信ができるResend APIを使用しています。

### 設定手順

1. **Resendアカウントの作成**
   - [Resend](https://resend.com)にアクセス
   - 無料アカウントを作成（GitHubアカウントでもサインアップ可能）

2. **APIキーの取得**
   - ダッシュボードにログイン
   - 「API Keys」セクションに移動
   - 「Create API Key」をクリック
   - APIキーをコピー

3. **環境変数の設定**
   `.env.local`ファイルに以下を追加：
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

4. **サーバーの再起動**
   ```bash
   npm run dev
   ```

### 無料プランの制限

- 月100通まで無料
- 送信元アドレスは`onboarding@resend.dev`に制限
- 独自ドメインを使用する場合は有料プランが必要

### メール送信テスト

APIキーを設定せずにテストする場合：
- メール送信はスキップされます
- コンソールに送信内容が表示されます
- エラーは発生しません

## その他のメール送信方法

### 1. SendGrid（パスワード不要）

```bash
npm install @sendgrid/mail
```

環境変数：
```env
SENDGRID_API_KEY=your-sendgrid-api-key
```

### 2. AWS SES（パスワード不要、AWSアカウント必要）

```bash
npm install @aws-sdk/client-ses
```

環境変数：
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-northeast-1
```

### 3. Mailgun（パスワード不要）

```bash
npm install mailgun-js
```

環境変数：
```env
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-domain.mailgun.org
```

## トラブルシューティング

### メールが送信されない場合

1. **コンソールログの確認**
   - ブラウザの開発者ツールでエラーを確認
   - サーバーのターミナルでログを確認

2. **APIキーの確認**
   - 正しいAPIキーが設定されているか確認
   - APIキーに送信権限があるか確認

3. **送信先アドレスの確認**
   - 有効なメールアドレスか確認
   - スパムフォルダも確認

## セキュリティに関する注意事項

- APIキーは絶対にGitにコミットしない
- `.env.local`は`.gitignore`に含まれていることを確認
- 本番環境では環境変数を安全に管理