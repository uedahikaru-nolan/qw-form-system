import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { SiteType } from '@/types'

// Vercel環境では環境変数が異なるタイミングで読み込まれる可能性があるため、
// リクエスト時に初期化する
let openai: OpenAI | null = null

function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

const SYSTEM_PROMPTS: Record<SiteType, string> = {
  HP: `あなたはホームページ作成をサポートするAIアシスタントです。
ユーザーの情報を段階的に収集し、適切なホームページの構成を提案します。
以下の点に注意してください：
- 必須項目：担当者名、メールアドレスは必ず収集してください
- 会社名（屋号）、サービス名は「あれば」なので、なければ次に進んでください
- コンセプトやVMV（Vision、Mission、Value）は「あれば」なので、なければ次に進んでください
- 順番通りに質問し、回答内容を理解してすでに回答された情報は再度聞かない
- ユーザーが複数の情報を一度に提供した場合は、それらを整理して未回答の項目のみ聞く
- 親しみやすく、プロフェッショナルなトーンで対話する
- サイトの内容、ページ数、納期、その他要望は自由記述なので、ユーザーの回答をそのまま受け入れる
- 参考URLが複数ある場合は、すべて記録する`,
  
  LP: `あなたはランディングページ作成をサポートするAIアシスタントです。
コンバージョンを最大化するために必要な情報を収集し、効果的なLPの構成を提案します。
以下の点に注意してください：
- ターゲットユーザーのペインポイントと解決策に焦点を当てる
- ユーザーの回答を踏まえて、より具体的な提案を行う
- すでに提供された情報は活用し、重複した質問はしない
- マーケティング視点でのアドバイスも適宜提供する`,
  
  PORTFOLIO: `あなたはポートフォリオサイト作成をサポートするAIアシスタントです。
クリエイターの魅力を最大限に引き出すために必要な情報を収集し、印象的なポートフォリオサイトの構成を提案します。
以下の点に注意してください：
- 作品の見せ方と個性の表現に重点を置く
- クリエイターの強みを引き出す質問をする
- 提供された情報から、さらに深掘りできる部分を見つける
- 業界のトレンドも踏まえたアドバイスを提供する`,
  
  WEBSYSTEM: `あなたはWebシステム作成をサポートするAIアシスタントです。
システムの要件を明確にし、効率的で使いやすいWebシステムの構成を提案します。
以下の点に注意してください：
- 機能要件と非機能要件の両方をバランスよく収集する
- 技術的な制約や要望を考慮する
- ユーザーの技術レベルに合わせた説明をする
- 実装の優先順位についてもアドバイスする`
}

export async function POST(request: NextRequest) {
  try {
    // APIキーの存在確認（デバッグ用）
    const client = getOpenAIClient()
    
    console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
    console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length)
    
    if (!client) {
      console.error('OPENAI_API_KEY is not set or invalid')
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }
    
    const { messages, siteType, industry, currentQuestion, isFormDataProvided, formDataSummary } = await request.json()
    
    if (!siteType || !SYSTEM_PROMPTS[siteType as SiteType]) {
      return NextResponse.json(
        { error: 'Invalid site type' },
        { status: 400 }
      )
    }
    
    const systemPrompt = SYSTEM_PROMPTS[siteType as SiteType]
    
    // フォームデータが提供されている場合は、初期挨拶を生成
    let systemMessage = systemPrompt
    
    if (formDataSummary && formDataSummary.length > 0) {
      // フォームデータが提供されている場合
      const formDataText = formDataSummary.map((item: any) => `${item.label}: ${item.value}`).join('\n')
      systemMessage = `${systemPrompt}\n\n業種: ${industry}\n\n重要な指示：
- ユーザーはフォームで以下の情報を提供しています：
${formDataText}

- 提供された情報を確認し、感謝の意を示してください
- フォームで提供された情報を踏まえた上で、自然な挨拶をしてください
- 担当者名がわかる場合は、「〇〇様」と呼びかけてください
- これから段階的に詳細を確認していくことを伝えてください
- 最初の質問をする必要はありません`
    } else if (isFormDataProvided) {
      // 提案生成モード
      systemMessage = `${systemPrompt}\n\n業種: ${industry}\n\n重要な指示：
- ユーザーはすでにフォームで必要な情報をすべて提供しています
- 会話履歴を確認し、提供された情報を整理してください
- 追加の質問はせず、いただいた情報を基に具体的なホームページ構成の提案を行ってください
- 提案には以下を含めてください：
  - ページ構成の提案（トップページ、各ページの内容）
  - コンセプトやVMVが提供されている場合は、それを反映したサイトの方向性
  - イメージカラーを活かしたデザインの方向性
  - 参考サイトを踏まえた特徴的な機能やレイアウトの提案
  - 納期に合わせたスケジュール感
- ポジティブで建設的な提案を心がけてください`
    } else {
      // 通常モード
      systemMessage = `${systemPrompt}\n\n業種: ${industry}\n\n重要な指示：
- これまでの会話履歴を確認し、すでに回答された情報は再度聞かないでください
- ユーザーが複数の情報を一度に提供した場合は、それらをすべて理解したことを示し、不足している情報のみを聞いてください
- 質問は自然な会話として行い、機械的にならないようにしてください
- 必要に応じて、ユーザーの回答に対してポジティブなフィードバックや提案を含めてください
- 現在の基本的な質問リストの質問番号: ${currentQuestion}

ユーザーの回答を踏まえて、自然な対話を続けてください。`
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: isFormDataProvided ? 1000 : 500,
    })
    
    const response = completion.choices[0].message.content || ''
    
    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    
    // クォータエラーの場合は特別なメッセージ
    if (error?.code === 'insufficient_quota' || error?.error?.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'API使用量の上限に達しました。手動入力モードで続行してください。' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}