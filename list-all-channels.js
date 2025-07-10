const { WebClient } = require('@slack/web-api');
require('dotenv').config({ path: '.env.local' });

const token = process.env.SLACK_BOT_TOKEN;
const slack = new WebClient(token);

async function listAllChannels() {
  try {
    console.log('Fetching all channels bot has access to...\n');
    
    // Get bot info
    const auth = await slack.auth.test();
    console.log('Bot:', auth.user);
    console.log('\n');
    
    // Try to get channel list
    try {
      const result = await slack.conversations.list({
        types: 'public_channel',
        limit: 100
      });
      
      console.log('Channels where bot is a member:');
      const memberChannels = result.channels.filter(ch => ch.is_member);
      memberChannels.forEach(channel => {
        console.log(`- #${channel.name} (${channel.id})`);
      });
      
      console.log('\n\nAll public channels:');
      result.channels.forEach(channel => {
        if (channel.name.includes('qw') || channel.name.includes('form') || channel.name.includes('notification')) {
          console.log(`- #${channel.name} (${channel.id}) ${channel.is_member ? '✅ Member' : '❌ Not member'}`);
        }
      });
    } catch (listError) {
      console.log('Cannot list channels. Trying alternative method...\n');
      
      // Test specific channel IDs
      const testChannels = [
        { name: 'general', id: 'C07F53QGWE4' },
        { name: 'dev-notification', id: 'C08GWS8N24U' }
      ];
      
      for (const ch of testChannels) {
        try {
          await slack.chat.postMessage({
            channel: ch.id,
            text: `Test access to #${ch.name}`
          });
          console.log(`✅ Can post to #${ch.name} (${ch.id})`);
        } catch (e) {
          console.log(`❌ Cannot post to #${ch.name} (${ch.id}): ${e.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listAllChannels();