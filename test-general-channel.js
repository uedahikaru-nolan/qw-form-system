const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_BOT_TOKEN || 'your-bot-token-here';
const generalChannelId = 'C07F53QGWE4'; // general channel ID
const slack = new WebClient(token);

async function testGeneralChannel() {
  console.log('=== Testing with #general channel ===\n');
  
  try {
    // Test if bot can post to general channel
    console.log('Sending test message to #general...');
    
    const mainMessage = await slack.chat.postMessage({
      channel: generalChannelId,
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
        }
      ]
    });
    
    if (mainMessage.ok) {
      console.log('✅ Main message sent successfully!');
      console.log('Message TS:', mainMessage.ts);
      
      // Send thread message
      console.log('\nSending thread message...');
      const threadMessage = await slack.chat.postMessage({
        channel: generalChannelId,
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
              text: '```\n会社名: テスト株式会社\nサイトタイプ: HP\nご担当者様のお名前: 山田太郎\nメールアドレス: test@example.com\n電話番号: 03-1234-5678\n```'
            }
          }
        ]
      });
      
      if (threadMessage.ok) {
        console.log('✅ Thread message sent successfully!');
        console.log('\n🎉 Both messages sent to #general channel!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2));
    }
  }
}

testGeneralChannel();