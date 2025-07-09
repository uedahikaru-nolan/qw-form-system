const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_BOT_TOKEN || 'your-bot-token-here';
const slack = new WebClient(token);

async function checkBotChannels() {
  try {
    // Botが参加しているチャンネルを取得
    const result = await slack.users.conversations({
      types: 'public_channel,private_channel',
      limit: 100
    });
    
    console.log('Bot is member of these channels:');
    if (result.channels && result.channels.length > 0) {
      result.channels.forEach(channel => {
        console.log(`- ${channel.name}: ${channel.id}`);
      });
    } else {
      console.log('Bot is not a member of any channels yet.');
      console.log('\nTo add the bot to a channel:');
      console.log('1. Go to the channel in Slack');
      console.log('2. Type: /invite @your-bot-name');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkBotChannels();