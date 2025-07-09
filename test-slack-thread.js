const { WebClient } = require('@slack/web-api');

// Bot Token と Channel ID
const token = process.env.SLACK_BOT_TOKEN || 'your-bot-token-here';
const channel = 'C08GWS8N24U'; // dev-notification

// Slack Web APIクライアントの初期化
const slack = new WebClient(token);

async function testSlackThread() {
  try {
    console.log('Sending main message...');
    
    // メインメッセージを送信
    const mainMessage = await slack.chat.postMessage({
      channel: channel,
      text: '<!channel> 【テスト会社】様よりフォームが入力されました！',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '<!channel> 【テスト会社】様よりフォームが入力されました！'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*📅 送信日時*\n${new Date().toLocaleString('ja-JP')}`
            },
            {
              type: 'mrkdwn',
              text: '*🌐 サイトタイプ*\nHP'
            }
          ]
        }
      ]
    });
    
    console.log('Main message sent:', mainMessage.ok ? 'Success' : 'Failed');
    
    if (mainMessage.ts) {
      console.log('Sending thread message...');
      
      // スレッドに詳細を投稿
      const threadMessage = await slack.chat.postMessage({
        channel: channel,
        thread_ts: mainMessage.ts,
        text: 'フォーム詳細内容',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '```\nこれはスレッドテストです。\nこのメッセージは元のメッセージのスレッドに表示されるはずです。\n```'
            }
          }
        ]
      });
      
      console.log('Thread message sent:', threadMessage.ok ? 'Success' : 'Failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.data) {
      console.error('Error details:', error.data);
    }
  }
}

testSlackThread();