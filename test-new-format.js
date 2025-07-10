const fetch = require('node-fetch');

async function testNewFormat() {
  console.log('Testing new Slack notification format...\n');
  
  const formData = {
    to: 'h_ueda@nolan.co.jp',
    isAdmin: true,
    content: `=== AIサイト作成フォーム 要約情報 ===

作成日時: 2025-07-10T11:30:00.000Z
サイトタイプ: HP
業種: IT・テクノロジー

【お客様情報】
会社名: 株式会社テストカンパニー
ご担当者名: 田中 太郎
メールアドレス: tanaka@test-company.co.jp
電話番号: 03-1234-5678
参考サイトURL:
  1. https://www.apple.com/jp/
  2. https://www.google.com/
  3. https://www.notion.so/

【AIによる要約・提案内容】
## 📋 収集した情報のまとめ

### 基本情報
- 会社名: 株式会社テストカンパニー
- 担当者名: 田中 太郎
- メールアドレス: tanaka@test-company.co.jp
- 電話番号: 03-1234-5678
- 参考サイトURL: Apple、Google、Notion

### コンセプト・想い
- 信頼性と革新性を両立するIT企業として、最新技術を活用したソリューションを提供
- ユーザーファーストの理念のもと、直感的で使いやすいサービスを展開

### 作成予定のコンテンツ
- 企業理念とビジョンの明確化
- 技術力と実績のアピール
- お客様事例と成功ストーリー
- 採用情報とチーム紹介

=== チャット履歴 ===

【AI】 (2025/7/10 20:30:00)
こんにちは！ホームページ作成のサポートを担当いたします。まずは基本情報から確認させていただきます。

【ユーザー】 (2025/7/10 20:30:15)
株式会社テストカンパニーの田中です。

【AI】 (2025/7/10 20:30:30)
田中様、よろしくお願いいたします。どのようなホームページをご希望でしょうか？

【ユーザー】 (2025/7/10 20:31:00)
IT企業として信頼性をアピールできるコーポレートサイトを作りたいです。AppleやGoogleのようなシンプルで洗練されたデザインを参考にしたいと思っています。`
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
      console.log('1. 🎯 Main message with structured customer info');
      console.log('2. 🤖 Thread with AI analysis and chat history');
    } else {
      console.log('❌ Error:', result);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testNewFormat();