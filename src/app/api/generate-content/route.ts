import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { SiteInfo, PageInfo, SiteType } from '@/types'

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

    const { siteInfo, chatHistory, summary } = await request.json()
    
    const prompt = createEnhancedPrompt(siteInfo, chatHistory, summary)
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `あなたはWebサイトのコンテンツを生成する専門家です。
要約された情報と提案されたサイト構成を基に、具体的で魅力的なWebサイトのコンテンツを生成してください。
各ページ・セクションごとに、実際に使用できる具体的なコピーテキストを作成してください。

重要な指示：
1. 各セクションに対して、100〜300文字程度の具体的なコピーテキストを生成する
2. チャット履歴から得られた情報を最大限活用する
3. 業種や事業内容に合った専門的で説得力のある文章を作成する
4. キャッチコピーは短く印象的に、説明文は詳細かつ分かりやすく
5. CTAボタンのテキストも含める`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    })
    
    const generatedContent = JSON.parse(completion.choices[0].message.content || '{}')
    
    // 基本情報も含めて返す
    const result = {
      basicInfo: generatedContent.basicInfo || siteInfo.basicInfo,
      pages: transformToPageInfo(generatedContent, siteInfo)
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}

function createEnhancedPrompt(siteInfo: SiteInfo, chatHistory: any[], summary?: string): string {
  const { type, industry, basicInfo } = siteInfo
  
  let prompt = `${industry}の${type}のコンテンツをJSON形式で生成してください。\n\n`
  
  if (summary) {
    prompt += `要約・提案内容:\n${summary}\n\n`
    prompt += `重要：上記の要約で提案されたページ構成を反映してください。\n\n`
  }
  
  // チャット履歴から重要な情報を抽出
  if (chatHistory && chatHistory.length > 0) {
    prompt += `チャット履歴から得られた重要な情報:\n`
    chatHistory.forEach((message: any) => {
      if (message.role === 'user') {
        prompt += `- ${message.content}\n`
      }
    })
    prompt += `\n`
  }
  
  prompt += `基本情報:\n`
  if (basicInfo) {
    Object.entries(basicInfo).forEach(([key, value]) => {
      if (value) prompt += `- ${key}: ${value}\n`
    })
  }
  
  prompt += `\n以下のJSON形式で出力してください：
{
  "basicInfo": {
    "name": "名称",
    "industry": "業種",
    "address": "住所",
    "phone": "電話番号",
    "businessHours": "営業時間",
    "holidays": "定休日",
    "concept": "コンセプト",
    "sns": "SNS情報"
  },
  "pages": [
    {
      "id": "home",
      "title": "ホーム",
      "sections": [
        {
          "id": "hero",
          "type": "hero",
          "title": "ヒーローセクション",
          "content": "キャッチコピー\\n\\nサブキャッチ\\n\\n説明文（100-200文字程度）"
        }
      ]
    }
  ]
}

注意事項：
- basicInfoには、チャットで収集した情報を整理して入れてください
- pagesは要約で提案された構成に従って作成してください
- 各ページ・セクションには、実際に使用できる具体的な文章を生成してください
- contentには改行を含めて読みやすく整形してください
- キャッチコピー、見出し、本文を適切に構成してください`
  
  return prompt
}

function transformToPageInfo(generatedContent: any, siteInfo: SiteInfo): PageInfo[] {
  if (!generatedContent.pages || !Array.isArray(generatedContent.pages)) {
    // フォールバック
    return generateDefaultPages(siteInfo)
  }
  
  return generatedContent.pages.map((page: any) => ({
    id: page.id || Math.random().toString(36).substr(2, 9),
    title: page.title || 'ページ',
    completionRate: 85,
    sections: (page.sections || []).map((section: any) => ({
      id: section.id || Math.random().toString(36).substr(2, 9),
      type: section.type || 'custom',
      title: section.title || 'セクション',
      content: section.content || '',
      isEditable: true
    }))
  }))
}

function generateDefaultPages(siteInfo: SiteInfo): PageInfo[] {
  const { type, industry, basicInfo } = siteInfo
  
  if (type === 'HP') {
    return [
      {
        id: 'home',
        title: 'ホーム',
        completionRate: 85,
        sections: [
          {
            id: 'hero',
            type: 'hero',
            title: 'メインビジュアル',
            content: `${basicInfo?.name || industry}へようこそ\n\n${basicInfo?.concept || '私たちは' + industry + 'として、お客様に最高のサービスを提供しています。'}`,
            isEditable: true
          },
          {
            id: 'features',
            type: 'services',
            title: '特徴',
            content: 'サービスの特徴をここに表示',
            isEditable: true
          }
        ]
      },
      {
        id: 'about',
        title: basicInfo?.name ? `${basicInfo.name}について` : '私たちについて',
        completionRate: 80,
        sections: [
          {
            id: 'about-main',
            type: 'about',
            title: '事業理念',
            content: basicInfo?.concept || '事業理念をここに表示',
            isEditable: true
          }
        ]
      }
    ]
  }
  
  return []
}