const { WebClient } = require('@slack/web-api');
require('dotenv').config({ path: '.env.local' });

const token = process.env.SLACK_BOT_TOKEN;
const slack = new WebClient(token);

async function checkBotMembership() {
  try {
    console.log('Checking bot membership...\n');
    
    // Get bot info
    const auth = await slack.auth.test();
    console.log('Bot User:', auth.user);
    console.log('Bot ID:', auth.user_id);
    console.log('Team:', auth.team);
    console.log('\n');
    
    // Try conversations.members to check if bot is in channel
    const channelId = 'C08GWS8N24U'; // dev-notification
    console.log('Checking membership in dev-notification (C08GWS8N24U)...');
    
    try {
      const members = await slack.conversations.members({
        channel: channelId
      });
      
      console.log('Total members in channel:', members.members.length);
      console.log('Bot is member:', members.members.includes(auth.user_id) ? '✅ YES' : '❌ NO');
      
      if (!members.members.includes(auth.user_id)) {
        console.log('\n⚠️  Bot is NOT a member of #dev-notification');
        console.log('\nTo fix this:');
        console.log('1. Go to #dev-notification channel in Slack');
        console.log('2. Type: /invite @qwnotif');
        console.log('3. Press Enter');
        console.log('\nNote: Make sure you have permission to invite bots to the channel.');
      }
    } catch (e) {
      if (e.data?.error === 'not_in_channel') {
        console.log('❌ Bot cannot access channel member list (not in channel)');
      } else {
        console.log('Error checking members:', e.message);
      }
    }
    
    // List channels where bot IS a member
    console.log('\n\nChannels where bot IS a member:');
    const result = await slack.conversations.list({
      types: 'public_channel',
      exclude_archived: true
    });
    
    const memberChannels = result.channels.filter(ch => ch.is_member);
    memberChannels.forEach(channel => {
      console.log(`✅ #${channel.name} (${channel.id})`);
    });
    
    if (memberChannels.length === 0) {
      console.log('❌ Bot is not a member of any channels!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2));
    }
  }
}

checkBotMembership();