const fetch = require('node-fetch');

async function testFormSubmission() {
  console.log('Testing form submission with thread...\n');
  
  const formData = {
    to: 'admin@company.com',
    isAdmin: true,
    content: `会社名: テスト株式会社
サイトタイプ: HP
ご担当者様のお名前: 山田太郎
メールアドレス: yamada@test.com
電話番号: 03-1234-5678
希望するサイトのコンセプト: 信頼性と革新性を表現するコーポレートサイト
ターゲット層: 法人顧客、投資家、求職者
必要なページ: トップページ、会社概要、事業内容、採用情報、お問い合わせ
参考URL:
- https://example.com/reference1
- https://example.com/reference2
その他の要望: レスポンシブ対応、多言語対応（日英）を希望`
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', result);
      console.log('\nCheck your Slack #test channel for:');
      console.log('1. Main message with @channel mention');
      console.log('2. Thread with detailed form content');
    } else {
      console.log('❌ Error:', result);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

// Check if node-fetch is installed
try {
  require('node-fetch');
  testFormSubmission();
} catch (e) {
  console.log('Installing node-fetch...');
  require('child_process').execSync('npm install node-fetch@2', { stdio: 'inherit' });
  console.log('Please run the script again.');
}