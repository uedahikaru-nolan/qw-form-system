const { WebClient } = require('@slack/web-api');
require('dotenv').config({ path: '.env.local' });

const token = process.env.SLACK_BOT_TOKEN;
const channelId = process.env.SLACK_CHANNEL_ID;
const slack = new WebClient(token);

async function testFullNotification() {
  console.log('Sending full test notification to #test channel...\n');
  
  try {
    // メインメッセージを送信
    const mainMessage = await slack.chat.postMessage({
      channel: channelId,
      text: '<!channel> 【テスト株式会社】様よりフォームが入力されました！',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '<!channel> 【テスト株式会社】様よりフォームが入力されました！'
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
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*👤 お客様*: テスト株式会社\n*📧 メール*: test@example.com'
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Notionで詳細を確認',
                emoji: true
              },
              url: 'https://www.notion.so/2185b8517dea80e8a10ec20da021e84d?v=2185b8517dea80c5adfe000c2b228e85&source=copy_link',
              style: 'primary'
            }
          ]
        }
      ]
    });
    
    console.log('✅ Main message sent to #test');
    console.log('   Message TS:', mainMessage.ts);
    
    // スレッドに詳細を投稿
    if (mainMessage.ok && mainMessage.ts) {
      const threadMessage = await slack.chat.postMessage({
        channel: channelId,
        thread_ts: mainMessage.ts,
        text: 'フォーム詳細内容',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '📋 フォーム詳細内容',
              emoji: true
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '```\n会社名: テスト株式会社\nサイトタイプ: HP\nご担当者様のお名前: 山田太郎\nメールアドレス: test@example.com\n電話番号: 03-1234-5678\n\n【希望するサイトのコンセプト】\nモダンでプロフェッショナルなコーポレートサイト\n\n【参考URL】\nhttps://example.com/reference1\nhttps://example.com/reference2\n```'
            }
          }
        ]
      });
      
      console.log('✅ Thread message sent');
      console.log('\n🎉 Both messages successfully sent to #test channel!');
      console.log('   Check your Slack for the notification with thread.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2));
    }
  }
}

testFullNotification();