# Slack スレッド機能の実装方法

現在のシステムはSlack Webhookを使用していますが、Webhookではスレッド機能を使用できません。
スレッドに詳細内容を投稿するには、Slack Web APIを使用する必要があります。

## 現在の制限

- **Webhook URL**: スレッド機能なし、単純なメッセージ送信のみ
- **送信される内容**: メインチャンネルに全て表示される

## スレッド機能を実装する方法

### 1. Slack Appの作成

1. [Slack API](https://api.slack.com/apps) にアクセス
2. 「Create New App」をクリック
3. 「From scratch」を選択
4. App名とワークスペースを選択

### 2. Bot Token Scopesの設定

OAuth & Permissions ページで以下のスコープを追加：
- `chat:write` - メッセージの送信
- `chat:write.public` - パブリックチャンネルへの送信

### 3. Botのインストールとトークン取得

1. 「Install to Workspace」をクリック
2. Bot User OAuth Tokenをコピー（xoxb-で始まる）

### 4. 環境変数の設定

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_CHANNEL_ID=C1234567890  # チャンネルID
```

### 5. コードの実装例

```typescript
// src/app/api/send-email/route.ts の改修案

import { WebClient } from '@slack/web-api';

// Slack Web APIクライアントの初期化
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// メインメッセージを送信
const mainMessage = await slack.chat.postMessage({
  channel: process.env.SLACK_CHANNEL_ID!,
  text: `<!channel> 【${companyName}】様よりフォームが入力されました！`,
  blocks: [
    // ... 現在のブロック構造
  ]
});

// スレッドに詳細を投稿
if (mainMessage.ts) {
  await slack.chat.postMessage({
    channel: process.env.SLACK_CHANNEL_ID!,
    thread_ts: mainMessage.ts,  // これがスレッドのキー
    text: 'フォーム詳細内容',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${content}\`\`\``
        }
      }
    ]
  });
}
```

### 6. 必要なパッケージのインストール

```bash
npm install @slack/web-api
```

## 移行手順

1. Slack Appを作成し、Bot Tokenを取得
2. 環境変数にトークンとチャンネルIDを設定
3. `@slack/web-api`パッケージをインストール
4. コードをWebhookからWeb APIに移行
5. テストして動作確認

## 注意事項

- Bot Tokenは機密情報なので、絶対に公開しないこと
- チャンネルIDは、Slackでチャンネルを右クリック→「View channel details」から確認可能
- Botをチャンネルに招待する必要がある（/invite @botname）