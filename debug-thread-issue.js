const { WebClient } = require('@slack/web-api');
require('dotenv').config({ path: '.env.local' });

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const channelId = process.env.SLACK_CHANNEL_ID;

async function debugThreadIssue() {
  console.log('Debugging thread issue...\n');
  console.log('Channel:', channelId);
  
  try {
    // Step 1: Send main message
    console.log('1. Sending main message...');
    const mainResult = await slack.chat.postMessage({
      channel: channelId,
      text: 'デバッグ用メインメッセージ'
    });
    
    console.log('Main message result:');
    console.log('- OK:', mainResult.ok);
    console.log('- TS:', mainResult.ts);
    console.log('- Channel:', mainResult.channel);
    
    if (!mainResult.ts) {
      console.error('❌ No timestamp returned from main message!');
      return;
    }
    
    // Step 2: Wait a bit
    console.log('\n2. Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Send thread message
    console.log('\n3. Sending thread message...');
    const threadResult = await slack.chat.postMessage({
      channel: channelId,
      thread_ts: mainResult.ts,
      text: 'デバッグ用スレッドメッセージ',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🧵 このメッセージはスレッド内に表示されるはずです'
          }
        }
      ]
    });
    
    console.log('\nThread message result:');
    console.log('- OK:', threadResult.ok);
    console.log('- TS:', threadResult.ts);
    console.log('- Thread TS:', threadResult.thread_ts);
    
    if (threadResult.ok) {
      console.log('\n✅ Both messages sent successfully!');
      console.log('Check #test channel for the messages.');
      console.log('The thread message should appear under the main message.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2));
    }
  }
}

debugThreadIssue();