import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    const { sectionTitle, currentContent, editRequest } = await request.json()

    if (!sectionTitle || !currentContent || !editRequest) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const systemPrompt = `あなたは優秀なコンテンツエディターです。
ユーザーから提供された現在のコンテンツを、指定された編集リクエストに従って改善してください。

以下のルールに従ってください：
1. 元のコンテンツの構造とフォーマットを維持する
2. 既存の情報は保持し、リクエストされた内容を追加または修正する
3. 「- 」で始まる箇条書き形式を維持する
4. 重要な部分は**太字**で強調する
5. セクションのタイトルに適した内容にする
6. 簡潔で分かりやすい表現を使用する`

    const userPrompt = `セクション: ${sectionTitle}

現在のコンテンツ:
${currentContent}

編集リクエスト: ${editRequest}

上記の編集リクエストに従って、コンテンツを改善してください。`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })

      const editedContent = completion.choices[0]?.message?.content || currentContent

      return NextResponse.json({ editedContent })
    } catch (openAIError: any) {
      console.error('OpenAI API error:', openAIError)
      
      if (openAIError?.status === 429) {
        return NextResponse.json(
          { error: 'API rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      
      throw openAIError
    }
  } catch (error) {
    console.error('Edit content error:', error)
    return NextResponse.json(
      { error: 'Failed to edit content' },
      { status: 500 }
    )
  }
}