# トラブルシューティングガイド

## メール送信エラーの解決方法

### 1. 一時的な解決策（テスト用）

`.env.local`に以下を追加してメール送信をスキップ：

```env
SKIP_EMAIL=true
```

これにより、メール送信をスキップして動作確認ができます。

### 2. Resend APIキーの確認

1. [Resend Dashboard](https://resend.com/api-keys)にログイン
2. APIキーが有効であることを確認
3. APIキーを再生成して`.env.local`を更新

### 3. サーバーログの確認

開発サーバーのコンソールで以下を確認：
- `Resend error:` で始まるエラーメッセージ
- `Error details:` の詳細情報

### 4. テストメールの送信

ブラウザで以下にアクセス：
```
http://localhost:3005/api/test-email
```

### 5. よくあるエラーと対処法

#### "Invalid API Key"
- APIキーが正しくコピーされているか確認
- APIキーの前後に空白がないか確認

#### "Domain not verified" 
- Resendの無料プランでは`onboarding@resend.dev`からのみ送信可能
- 独自ドメインを使用する場合は有料プランが必要

#### "Rate limit exceeded"
- 無料プランは月100通まで
- 制限に達した場合は翌月まで待つか有料プランにアップグレード

### 6. 代替メールサービスの使用

SendGridやMailgunなど、他のメールサービスを使用することも可能です。
詳細は`EMAIL_SETUP.md`を参照してください。