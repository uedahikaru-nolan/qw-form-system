const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_BOT_TOKEN || 'your-bot-token-here';
const channel = 'C08GWS8N24U'; // dev-notification
const slack = new WebClient(token);

async function testChannel() {
  try {
    console.log('Testing channel:', channel);
    
    // メインメッセージ
    const mainMessage = await slack.chat.postMessage({
      channel: channel,
      text: '【テスト会社】様よりフォームが入力されました！',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '【テスト会社】様よりフォームが入力されました！'
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
    
    console.log('Main message sent:', mainMessage.ok);
    console.log('Message TS:', mainMessage.ts);
    console.log('Channel:', mainMessage.channel);
    
    if (mainMessage.ok && mainMessage.ts) {
      console.log('\nSending thread message...');
      
      // スレッドメッセージ
      const threadMessage = await slack.chat.postMessage({
        channel: channel,
        thread_ts: mainMessage.ts,
        text: 'フォーム詳細内容',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '📋 **フォーム詳細内容**\n```\nこれはスレッドのテストメッセージです。\n正常に動作すれば、このメッセージは上のメッセージのスレッドに表示されます。\n```'
            }
          }
        ]
      });
      
      console.log('Thread message sent:', threadMessage.ok);
      console.log('Thread TS:', threadMessage.ts);
      
      if (threadMessage.ok) {
        console.log('\n✅ Success! Check the #dev-notification channel in Slack.');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2));
    }
  }
}

testChannel();