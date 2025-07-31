# 本番環境でSlack通知が動作しない問題のデバッグ手順

## 1. Vercelのログを確認

1. https://vercel.com にログイン
2. プロジェクトを選択
3. **Functions** タブをクリック
4. `api/send-email` をクリック
5. **Logs** でエラーの詳細を確認

## 2. 環境変数の確認

Vercelダッシュボードで以下の環境変数が設定されているか確認：

- `SLACK_BOT_TOKEN` - xoxb-で始まるトークン
- `SLACK_CHANNEL_ID` - C095KAA0K4Z (#testチャンネル)
- `RESEND_API_KEY` - re_で始まるキー
- `OPENAI_API_KEY` - sk-で始まるキー

**重要**: 環境変数を追加・変更した後は、必ず再デプロイが必要です。

## 3. よくある問題と解決方法

### 環境変数が認識されない
- Vercelで環境変数を設定後、再デプロイしていない
- Production環境用に設定していない（All Environmentsを選択）

### Slack APIエラー
- ボットトークンの有効期限切れ
- ボットがチャンネルに参加していない
- チャンネルIDが間違っている

### テスト方法

本番環境のAPIをテストするスクリプトを用意しました：

```bash
node test-production-api.js
```

このスクリプトで500エラーが出る場合は、Vercelのログで詳細を確認してください。

## 4. 環境変数の再デプロイ

環境変数を設定・変更した後：

1. Vercelダッシュボードで「Deployments」タブを開く
2. 最新のデプロイメントの「...」メニューから「Redeploy」を選択
3. 「Use existing Build Cache」のチェックを**外す**
4. 「Redeploy」をクリック

これで環境変数が反映されます。