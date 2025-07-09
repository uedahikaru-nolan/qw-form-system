const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_BOT_TOKEN || 'your-bot-token-here';
const slack = new WebClient(token);

async function createChannel() {
  try {
    // チャンネルを作成
    const result = await slack.conversations.create({
      name: 'qw-form-notification',
      is_private: false
    });
    
    if (result.ok) {
      console.log('Channel created successfully!');
      console.log(`Channel name: ${result.channel.name}`);
      console.log(`Channel ID: ${result.channel.id}`);
      console.log('\nPlease update your .env.local file with:');
      console.log(`SLACK_CHANNEL_ID=${result.channel.id}`);
    }
  } catch (error) {
    if (error.data && error.data.error === 'name_taken') {
      console.log('Channel already exists. Getting channel info...');
      
      // チャンネルリストから既存のチャンネルを探す
      try {
        const list = await slack.conversations.list({
          types: 'public_channel',
          limit: 1000
        });
        
        const channel = list.channels.find(ch => ch.name === 'qw-form-notification');
        if (channel) {
          console.log(`Channel ID: ${channel.id}`);
          console.log('\nPlease update your .env.local file with:');
          console.log(`SLACK_CHANNEL_ID=${channel.id}`);
        }
      } catch (listError) {
        console.error('Error getting channel list:', listError.message);
      }
    } else {
      console.error('Error:', error.message);
      if (error.data) {
        console.error('Details:', error.data);
      }
    }
  }
}

createChannel();