const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_BOT_TOKEN || 'your-bot-token-here';
const slack = new WebClient(token);

async function getChannels() {
  try {
    // パブリックチャンネルのリストを取得
    const result = await slack.conversations.list({
      types: 'public_channel',
      limit: 100
    });
    
    console.log('Available channels:');
    result.channels.forEach(channel => {
      console.log(`- ${channel.name}: ${channel.id}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getChannels();