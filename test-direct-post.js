const { WebClient } = require('@slack/web-api');
require('dotenv').config({ path: '.env.local' });

const token = process.env.SLACK_BOT_TOKEN;
const channelId = process.env.SLACK_CHANNEL_ID;
const slack = new WebClient(token);

async function testDirectPost() {
  console.log('Testing direct post to channel:', channelId);
  console.log('Token:', token.substring(0, 20) + '...\n');
  
  try {
    // Try to post a message directly
    const result = await slack.chat.postMessage({
      channel: channelId,
      text: 'テストメッセージ from qwnotif bot',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🤖 *Bot接続テスト*\nこのメッセージが表示されていれば、Botは正常に動作しています。'
          }
        }
      ]
    });
    
    console.log('✅ Message sent successfully!');
    console.log('Channel:', result.channel);
    console.log('Timestamp:', result.ts);
    console.log('Message:', result.message.text);
    
  } catch (error) {
    console.error('❌ Error posting message:', error.message);
    if (error.data) {
      console.error('Error details:', JSON.stringify(error.data, null, 2));
    }
    
    if (error.data?.error === 'not_in_channel') {
      console.log('\n⚠️  Bot is not in the channel!');
      console.log('Please make sure you invited the bot with: /invite @qwnotif');
    }
  }
}

testDirectPost();