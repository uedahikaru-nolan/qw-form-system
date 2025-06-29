import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { SiteType } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPTS: Record<SiteType, string> = {
  HP: `あなたはホームページ作成をサポートするAIアシスタントです。
ユーザーの業種に合わせて、必要な情報を段階的に収集し、魅力的なホームページの構成を提案します。
以下の点に注意してください：
- ユーザーの回答内容を理解し、すでに回答された情報は再度聞かない
- 回答内容に応じて、追加の質問や提案を柔軟に行う
- 親しみやすく、プロフェッショナルなトーンで対話する
- 複数の情報が一度に提供された場合は、それらを整理して次の質問に進む`,
  
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
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set')
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }
    
    const { messages, siteType, industry, currentQuestion } = await request.json()
    
    if (!siteType || !SYSTEM_PROMPTS[siteType as SiteType]) {
      return NextResponse.json(
        { error: 'Invalid site type' },
        { status: 400 }
      )
    }
    
    const systemPrompt = SYSTEM_PROMPTS[siteType as SiteType]
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}\n\n業種: ${industry}\n\n重要な指示：
- これまでの会話履歴を確認し、すでに回答された情報は再度聞かないでください
- ユーザーが複数の情報を一度に提供した場合は、それらをすべて理解したことを示し、不足している情報のみを聞いてください
- 質問は自然な会話として行い、機械的にならないようにしてください
- 必要に応じて、ユーザーの回答に対してポジティブなフィードバックや提案を含めてください
- 現在の基本的な質問リストの質問番号: ${currentQuestion}

ユーザーの回答を踏まえて、自然な対話を続けてください。`
        },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: 500,
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