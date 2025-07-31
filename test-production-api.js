const https = require('https');

async function testProductionAPI() {
  console.log('Testing production API at https://form.cldv.jp/api/send-email\n');
  
  const formData = {
    to: 'admin@company.com',
    isAdmin: true,
    content: `会社名: 本番環境テスト株式会社
サイトタイプ: HP
ご担当者様のお名前: 本番テスト
メールアドレス: test@production.com
電話番号: 03-9999-9999
希望するサイトのコンセプト: 本番環境でのSlack通知テスト`
  };
  
  const data = JSON.stringify(formData);
  
  const options = {
    hostname: 'form.cldv.jp',
    path: '/api/send-email',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };
  
  const req = https.request(options, (res) => {
    let responseData = '';
    
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('\nResponse:');
      try {
        const parsed = JSON.parse(responseData);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log(responseData);
      }
      
      if (res.statusCode === 200) {
        console.log('\n✅ API call succeeded');
        console.log('Check your Slack #test channel for the notification');
      } else {
        console.log('\n❌ API call failed');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Request error:', error);
  });
  
  req.write(data);
  req.end();
}

testProductionAPI();