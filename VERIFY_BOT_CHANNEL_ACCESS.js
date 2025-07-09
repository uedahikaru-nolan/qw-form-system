const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_BOT_TOKEN || 'your-bot-token-here';
const channelId = process.env.SLACK_CHANNEL_ID || 'C08GWS8N24U';
const slack = new WebClient(token);

async function verifyBotChannelAccess() {
  console.log('=== Slack Bot チャンネルアクセス確認 ===\n');
  console.log('Bot Token:', token.substring(0, 20) + '...');
  console.log('Channel ID:', channelId);
  console.log('\n');

  try {
    // 1. Bot情報を確認
    console.log('1. Bot情報を確認中...');
    const authTest = await slack.auth.test();
    console.log('✅ Bot認証成功');
    console.log('   - Bot名: @' + authTest.user);
    console.log('   - Bot ID:', authTest.user_id);
    console.log('\n');

    // 2. チャンネル情報を確認
    console.log('2. チャンネル情報を確認中...');
    try {
      const channelInfo = await slack.conversations.info({
        channel: channelId
      });
      console.log('✅ チャンネル発見');
      console.log('   - チャンネル名: #' + channelInfo.channel.name);
      console.log('   - チャンネルID:', channelInfo.channel.id);
      console.log('\n');
    } catch (error) {
      console.log('❌ チャンネル情報取得エラー:', error.message);
      console.log('\n');
    }

    // 3. Botがチャンネルのメンバーか確認
    console.log('3. Botのチャンネルメンバーシップを確認中...');
    try {
      const members = await slack.conversations.members({
        channel: channelId
      });
      
      if (members.members.includes(authTest.user_id)) {
        console.log('✅ Botはチャンネルのメンバーです！');
        console.log('\n');
        
        // テストメッセージを送信
        console.log('4. テストメッセージを送信中...');
        const testMessage = await slack.chat.postMessage({
          channel: channelId,
          text: '✅ Bot接続テスト成功！このBotはチャンネルに正常にアクセスできます。'
        });
        
        if (testMessage.ok) {
          console.log('✅ テストメッセージ送信成功！');
          console.log('   Slackでメッセージを確認してください。');
        }
      } else {
        console.log('❌ Botはチャンネルのメンバーではありません！');
        console.log('\n');
        console.log('📌 解決方法:');
        console.log('   1. Slackでチャンネルを開く');
        console.log('   2. 以下のコマンドを入力:');
        console.log(`      /invite @${authTest.user}`);
        console.log('   3. Enterキーを押してBotを招待');
      }
    } catch (error) {
      if (error.data?.error === 'not_in_channel') {
        console.log('❌ Botはチャンネルに参加していません！');
        console.log('\n');
        console.log('📌 解決方法:');
        console.log('   1. Slackでチャンネルを開く');
        console.log('   2. 以下のコマンドを入力:');
        console.log(`      /invite @${authTest.user}`);
        console.log('   3. Enterキーを押してBotを招待');
      } else {
        console.log('❌ エラー:', error.message);
      }
    }

  } catch (error) {
    console.log('❌ エラーが発生しました:', error.message);
    if (error.data) {
      console.log('詳細:', JSON.stringify(error.data, null, 2));
    }
  }

  console.log('\n=== 確認完了 ===');
}

// スクリプトを実行
verifyBotChannelAccess();