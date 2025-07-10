# qw-form-notificationチャンネル設定手順

## 1. 新しいチャンネルを作成

Slackで以下の手順を実行：

1. Slackの左サイドバーで「チャンネル」の横の「+」をクリック
2. 「チャンネルを作成」を選択
3. チャンネル名: `qw-form-notification`
4. 説明: フォーム送信通知用チャンネル
5. 「作成」をクリック

## 2. Botを招待

作成したチャンネルで：
```
/invite @qwnotif
```

## 3. チャンネルIDを確認

1. #qw-form-notificationチャンネルを右クリック
2. 「チャンネル詳細を表示」を選択
3. 一番下の「その他」セクションを展開
4. チャンネルIDをコピー（Cで始まる文字列）

## 4. 環境変数を更新

`.env.local`ファイルを編集：
```
SLACK_CHANNEL_ID=新しいチャンネルID
```

## 5. アプリケーションを再起動

```bash
# Next.jsを再起動
npm run dev
```

## 現在の設定

現在は **#00-general** チャンネルを使用しています。
- チャンネルID: C07F53QGWE4
- Bot: 既に参加済み ✅
- 動作確認: 完了 ✅

## トラブルシューティング

もし「not_in_channel」エラーが出る場合：

1. Botが本当に招待されているか確認
   ```bash
   node check-bot-membership.js
   ```

2. チャンネルIDが正しいか確認
   ```bash
   node list-all-channels.js
   ```

3. 手動でテストメッセージを送信
   ```bash
   curl http://localhost:3000/api/test-slack
   ```