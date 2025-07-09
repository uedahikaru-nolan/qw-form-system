const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_BOT_TOKEN || 'your-bot-token-here';
const slack = new WebClient(token);

async function findBotInfo() {
  try {
    // Bot自身の情報を取得
    const authTest = await slack.auth.test();
    console.log('Bot info:');
    console.log('- User ID:', authTest.user_id);
    console.log('- User:', authTest.user);
    console.log('- Team:', authTest.team);
    console.log('- Bot ID:', authTest.bot_id);
    
    console.log('\n使用可能なスコープ:');
    const scopes = authTest.response_metadata?.scopes || [];
    scopes.forEach(scope => console.log('-', scope));
    
    console.log('\n\nBotをチャンネルに追加する方法:');
    console.log('1. Slackでチャンネルを開く');
    console.log(`2. 以下のコマンドを入力: /invite @${authTest.user}`);
    console.log('\nまたは、Slack App管理画面でBotをチャンネルに追加してください。');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findBotInfo();