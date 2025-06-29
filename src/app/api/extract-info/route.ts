import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { SiteInfo, ChatMessage } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { chatHistory, siteType, industry } = await request.json()
    
    const systemPrompt = `あなたは会話内容から重要な情報を抽出する専門家です。
以下のチャット履歴から、${industry}の${siteType}作成に必要な情報を抽出してください。

抽出する情報:
- 名称（店舗名、会社名、サービス名など）
- 住所
- 電話番号
- 営業時間
- 定休日
- コンセプトや特徴
- メニューや提供サービス
- 写真の有無
- 予約システムの必要性
- SNSアカウント
- こだわりやストーリー
- その他の重要な情報

JSON形式で出力してください。情報が明示的に提供されていない場合は、その項目をnullとしてください。
複数の情報が一文で提供されている場合は、適切に分解して抽出してください。`

    const chatContent = chatHistory.map((msg: ChatMessage) => 
      `${msg.role === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`
    ).join('\n\n')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `チャット履歴:\n${chatContent}\n\n上記の会話から情報を抽出してJSON形式で出力してください。`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    })

    const extractedInfo = JSON.parse(completion.choices[0].message.content || '{}')
    
    // SiteInfo形式に変換
    const siteInfo: SiteInfo = {
      type: siteType,
      industry: industry,
      basicInfo: {
        name: extractedInfo.name || extractedInfo.店舗名 || extractedInfo.会社名,
        address: extractedInfo.address || extractedInfo.住所,
        phone: extractedInfo.phone || extractedInfo.電話番号,
        businessHours: extractedInfo.businessHours || extractedInfo.営業時間,
        holidays: extractedInfo.holidays || extractedInfo.定休日,
        concept: extractedInfo.concept || extractedInfo.コンセプト || extractedInfo.特徴,
        menu: extractedInfo.menu || extractedInfo.メニュー || extractedInfo.サービス,
        photos: extractedInfo.photos || extractedInfo.写真 || false,
        reservation: extractedInfo.reservation || extractedInfo.予約 || false,
        sns: extractedInfo.sns || extractedInfo.SNS,
        specialFeatures: extractedInfo.specialFeatures || extractedInfo.こだわり || extractedInfo.ストーリー
      }
    }
    
    return NextResponse.json({ siteInfo, rawExtracted: extractedInfo })
  } catch (error) {
    console.error('Info extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract information' },
      { status: 500 }
    )
  }
}