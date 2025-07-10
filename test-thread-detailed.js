const { WebClient } = require('@slack/web-api');
require('dotenv').config({ path: '.env.local' });

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const channelId = process.env.SLACK_CHANNEL_ID;

async function testThreadDetailed() {
  console.log('Testing thread functionality with detailed logging...\n');
  
  try {
    // Send main message
    const mainMessage = await slack.chat.postMessage({
      channel: channelId,
      text: '【詳細テスト】メインメッセージ - ' + new Date().toLocaleTimeString('ja-JP'),
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🔍 **詳細テスト** - このメッセージの下にスレッドが作成されます'
          }
        }
      ]
    });
    
    console.log('Main message response:');
    console.log(JSON.stringify(mainMessage, null, 2));
    
    if (!mainMessage.ok || !mainMessage.ts) {
      console.error('Failed to get message timestamp!');
      return;
    }
    
    console.log('\n📍 Main message timestamp:', mainMessage.ts);
    console.log('Waiting 1 second before sending thread message...\n');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Send thread message with the EXACT same channel and thread_ts
    const threadMessage = await slack.chat.postMessage({
      channel: channelId,  // Same channel
      thread_ts: mainMessage.ts,  // Use the timestamp from main message
      text: 'スレッド内のメッセージ - ' + new Date().toLocaleTimeString('ja-JP'),
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📋 スレッド詳細',
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '```\nこのメッセージはスレッド内に表示されます。\n時刻: ' + new Date().toLocaleString('ja-JP') + '\n```'
          }
        }
      ]
    });
    
    console.log('Thread message response:');
    console.log(JSON.stringify(threadMessage, null, 2));
    
    console.log('\n📊 Summary:');
    console.log('- Main message TS:', mainMessage.ts);
    console.log('- Thread message TS:', threadMessage.ts);
    console.log('- Thread parent TS:', threadMessage.thread_ts || 'NOT SET');
    console.log('\n✅ Check #test channel now!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testThreadDetailed();