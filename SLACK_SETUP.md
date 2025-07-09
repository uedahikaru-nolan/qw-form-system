# Slack通知設定ガイド

## 現在の設定

- **Bot名**: @qwnotif
- **Bot Token**: 環境変数に設定済み
- **チャンネル**: `dev-notification` (ID: C08GWS8N24U)

## セットアップ手順

### 1. Botをチャンネルに追加する

Slackで以下の手順を実行してください：

1. `#dev-notification` チャンネルを開く
2. メッセージ入力欄に以下のコマンドを入力：
   ```
   /invite @qwnotif
   ```
3. Enterキーを押してBotを招待

### 2. 新しいチャンネルを作成する場合

もし `qw-form-notification` という専用チャンネルを作成したい場合：

1. Slackで新しいチャンネルを作成
   - チャンネル名: `qw-form-notification`
   - パブリックチャンネルとして作成

2. 作成したチャンネルにBotを招待
   ```
   /invite @qwnotif
   ```

3. チャンネルIDを確認
   - チャンネルを右クリック → "View channel details"
   - URLの最後の部分がチャンネルID（Cで始まる文字列）

4. `.env.local` を更新
   ```
   SLACK_CHANNEL_ID=新しいチャンネルID
   ```

## 動作確認

1. テストエンドポイントを使用：
   ```bash
   curl http://localhost:3000/api/test-slack
   ```

2. 実際のフォーム送信をテスト：
   ```bash
   curl -X POST http://localhost:3000/api/send-email \
     -H "Content-Type: application/json" \
     -d '{
       "to": "test@example.com",
       "content": "テスト内容",
       "isAdmin": true
     }'
   ```

## トラブルシューティング

### "not_in_channel" エラーが出る場合
- Botがチャンネルに招待されていません
- 上記の手順1を実行してください

### "channel_not_found" エラーが出る場合
- チャンネルIDが間違っています
- チャンネルIDを確認して`.env.local`を更新してください

### スレッドにメッセージが投稿されない場合
- コンソールログを確認
- `Main message response: true ts: xxxxx` が表示されているか確認
- `Thread message response: true` が表示されているか確認

## 現在の実装

1. **メインメッセージ**: チャンネルに通知
2. **スレッドメッセージ**: 詳細内容を自動的にスレッドに投稿

これにより、チャンネルがクリーンに保たれ、詳細はスレッドで確認できます。