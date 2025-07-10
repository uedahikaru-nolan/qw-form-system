const { WebClient } = require('@slack/web-api');
require('dotenv').config({ path: '.env.local' });

const token = process.env.SLACK_BOT_TOKEN;
const slack = new WebClient(token);

async function findTestChannel() {
  try {
    console.log('Searching for test channel...\n');
    
    // Get all channels
    const result = await slack.conversations.list({
      types: 'public_channel',
      limit: 1000
    });
    
    // Find channels with "test" in the name
    const testChannels = result.channels.filter(channel => 
      channel.name.toLowerCase().includes('test')
    );
    
    if (testChannels.length > 0) {
      console.log('Found test channels:');
      testChannels.forEach(channel => {
        console.log(`\n📌 #${channel.name}`);
        console.log(`   ID: ${channel.id}`);
        console.log(`   Bot is member: ${channel.is_member ? '✅ Yes' : '❌ No'}`);
        
        if (!channel.is_member) {
          console.log(`   → Run: /invite @qwnotif in #${channel.name}`);
        }
      });
      
      // Get the most recently created test channel
      const latestTestChannel = testChannels.sort((a, b) => b.created - a.created)[0];
      console.log(`\n\n🎯 Most recent test channel: #${latestTestChannel.name} (${latestTestChannel.id})`);
      console.log('\nTo use this channel, update .env.local:');
      console.log(`SLACK_CHANNEL_ID=${latestTestChannel.id}`);
      
    } else {
      console.log('❌ No test channels found');
      console.log('\nAll public channels:');
      result.channels.slice(0, 10).forEach(channel => {
        console.log(`- #${channel.name} (${channel.id}) ${channel.is_member ? '✅' : ''}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findTestChannel();