const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_BOT_TOKEN;
const slack = new WebClient(token);

async function findChannelId() {
  try {
    console.log('Searching for qw-form-notification channel...\n');
    
    // Get all channels
    const result = await slack.conversations.list({
      types: 'public_channel,private_channel',
      limit: 1000
    });
    
    // Find qw-form-notification channel
    const targetChannel = result.channels.find(channel => 
      channel.name === 'qw-form-notification'
    );
    
    if (targetChannel) {
      console.log('✅ Found qw-form-notification channel!');
      console.log('Channel ID:', targetChannel.id);
      console.log('Channel Name:', targetChannel.name);
      console.log('Is Member:', targetChannel.is_member ? 'Yes' : 'No');
      
      if (!targetChannel.is_member) {
        console.log('\n⚠️  Bot is not a member of this channel!');
        console.log('Please run: /invite @qwnotif in the channel');
      }
      
      console.log('\nUpdate your .env.local file:');
      console.log(`SLACK_CHANNEL_ID=${targetChannel.id}`);
    } else {
      console.log('❌ Channel "qw-form-notification" not found');
      console.log('\nAvailable channels:');
      result.channels.forEach(channel => {
        if (channel.name.includes('qw') || channel.name.includes('form')) {
          console.log(`- #${channel.name} (${channel.id})`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findChannelId();