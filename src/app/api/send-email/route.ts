import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { WebClient } from '@slack/web-api'

export async function POST(request: NextRequest) {
  try {
    const { to, content, isAdmin } = await request.json()
    
    // 環境変数のデバッグログ
    console.log('Environment check:', {
      hasSlackToken: !!process.env.SLACK_BOT_TOKEN,
      hasSlackChannel: !!process.env.SLACK_CHANNEL_ID,
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      slackTokenPrefix: process.env.SLACK_BOT_TOKEN?.substring(0, 10) + '...',
      slackChannelId: process.env.SLACK_CHANNEL_ID
    })
    
    // SKIPが有効な場合は処理をスキップ
    if (process.env.SKIP_EMAIL === 'true') {
      console.log('Email sending is skipped (SKIP_EMAIL=true)')
      return NextResponse.json({ success: true, skipped: true })
    }
    
    // Slack Web APIに送信（管理者メールの場合のみ）
    if (isAdmin && process.env.SLACK_BOT_TOKEN && process.env.SLACK_CHANNEL_ID) {
      try {
        // Slack Web APIクライアントの初期化
        const slack = new WebClient(process.env.SLACK_BOT_TOKEN)
        
        console.log('Using Slack Web API with channel:', process.env.SLACK_CHANNEL_ID)
        
        // フォーム内容を解析して構造化
        const lines = content.split('\n').filter((line: string) => line.trim())
        const formData: Record<string, string> = {}
        
        lines.forEach((line: string) => {
          const colonIndex = line.indexOf(':')
          if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim()
            const value = line.substring(colonIndex + 1).trim()
            if (key && value) {
              formData[key] = value
            }
          }
        })
        
        // 会社名を取得（優先順位: 会社名 > ご担当者名 > お名前）
        const companyName = formData['会社名'] || formData['ご担当者名'] || formData['お名前'] || formData['ご担当者様のお名前'] || '未入力'
        
        // フォーム内容から重要な情報を抽出
        const extractFormInfo = (content: string) => {
          const info = {
            companyName: formData['会社名'] || '未入力',
            contactName: formData['ご担当者名'] || formData['ご担当者様のお名前'] || '未入力',
            email: formData['メールアドレス'] || '未入力',
            phone: formData['電話番号'] || '未入力',
            siteType: formData['サイトタイプ'] || '未指定',
            industry: formData['業種'] || '未指定',
            concept: '',
            vmv: '',
            pages: [] as string[],
            targetAudience: '',
            requests: ''
          }
          
          // コンセプトの詳細を取得
          const conceptMatch = content.match(/希望するサイトのコンセプト[：:]\s*(.+?)(?=\n|$)/s)
          if (conceptMatch) {
            info.concept = conceptMatch[1].trim()
          }
          
          // ビジョン・ミッション・バリューを取得
          const vmvMatch = content.match(/ビジョン・ミッション・バリュー[：:]\s*(.+?)(?=\n\S|$)/s)
          if (vmvMatch) {
            info.vmv = vmvMatch[1].trim()
          }
          
          // 必要なページを取得
          const pagesMatch = content.match(/必要なページ[：:]\s*(.+?)(?=\n\S|$)/s)
          if (pagesMatch) {
            info.pages = pagesMatch[1].split(/[、,]/).map(p => p.trim()).filter(p => p)
          }
          
          // ターゲット層を取得
          const targetMatch = content.match(/ターゲット層[：:]\s*(.+?)(?=\n|$)/)
          if (targetMatch) {
            info.targetAudience = targetMatch[1].trim()
          }
          
          // その他の要望を取得
          const requestsMatch = content.match(/その他の要望[：:]\s*(.+?)(?=\n\S|$)/s)
          if (requestsMatch) {
            info.requests = requestsMatch[1].trim()
          }
          
          return info
        }
        
        const formInfo = extractFormInfo(content)
        
        // AI分析コメントを生成
        const generateAIComment = () => {
          const comments = []
          
          // サイトタイプに基づくコメント
          if (formInfo.siteType === 'HP') {
            comments.push('📊 コーポレートサイトをご希望です。企業イメージとブランディングが重要になります。')
          } else if (formInfo.siteType === 'EC') {
            comments.push('🛒 ECサイトをご希望です。決済システムと在庫管理の実装が必要です。')
          } else if (formInfo.siteType === 'LP') {
            comments.push('🎯 ランディングページをご希望です。コンバージョン率を重視した設計が求められます。')
          }
          
          // ページ数に基づくコメント
          if (formInfo.pages.length > 0) {
            if (formInfo.pages.length <= 5) {
              comments.push(`📄 ${formInfo.pages.length}ページ構成のコンパクトなサイトです。`)
            } else if (formInfo.pages.length <= 10) {
              comments.push(`📚 ${formInfo.pages.length}ページ構成の中規模サイトです。`)
            } else {
              comments.push(`📖 ${formInfo.pages.length}ページ以上の大規模サイトです。`)
            }
          }
          
          // その他の要望に基づくコメント
          if (formInfo.requests.includes('レスポンシブ')) {
            comments.push('📱 レスポンシブ対応を希望されています。モバイルファーストの設計が重要です。')
          }
          if (formInfo.requests.includes('多言語')) {
            comments.push('🌍 多言語対応を希望されています。国際化の実装が必要です。')
          }
          
          return comments.join('\n')
        }
        
        const aiAnalysis = generateAIComment()
        
        // チャット履歴を取得（もしあれば）
        const chatHistory = (formData['チャット履歴'] || '').trim()
        
        try {
          // メインメッセージを投稿
          const mainMessage = await slack.chat.postMessage({
            channel: process.env.SLACK_CHANNEL_ID,
            text: `新規お問い合わせ: ${companyName}様`,
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: '🎉 新規お問い合わせが届きました！',
                  emoji: true
                }
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `<!channel> *${companyName}様* からお問い合わせです`
                }
              },
              {
                type: 'divider'
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `*🏢 会社名*\n${formInfo.companyName}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*👤 ご担当者*\n${formInfo.contactName}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*📧 メール*\n${formInfo.email}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*📞 電話番号*\n${formInfo.phone}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*🌐 サイトタイプ*\n${formInfo.siteType}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*🏭 業種*\n${formInfo.industry}`
                  }
                ]
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*💡 希望コンセプト*\n${formInfo.concept || '記載なし'}`
                }
              },
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: '📋 対応開始',
                      emoji: true
                    },
                    style: 'primary',
                    value: 'start_response'
                  }
                ]
              }
            ]
          })
          
          console.log('Main message posted:', mainMessage.ts)
          
          // スレッドに詳細情報を投稿
          if (mainMessage.ts) {
            const threadMessage = await slack.chat.postMessage({
              channel: process.env.SLACK_CHANNEL_ID,
              thread_ts: mainMessage.ts,
              text: 'AI分析結果と技術的詳細',
              blocks: [
                {
                  type: 'header',
                  text: {
                    type: 'plain_text',
                    text: '🤖 AI分析結果・技術的詳細',
                    emoji: true
                  }
                },
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: '*AIによる分析結果*'
                  }
                },
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `\`\`\`${aiAnalysis.trim()}\`\`\``
                  }
                },
                ...(chatHistory ? [
                  {
                    type: 'section' as const,
                    text: {
                      type: 'mrkdwn' as const,
                      text: '*チャット履歴*'
                    }
                  },
                  {
                    type: 'section' as const,
                    text: {
                      type: 'mrkdwn' as const,
                      text: `\`\`\`${chatHistory.trim()}\`\`\``
                    }
                  }
                ] : []),
                {
                  type: 'context',
                  elements: [
                    {
                      type: 'mrkdwn',
                      text: '💡 この詳細情報は開発・分析用です。お客様対応時は上記のメイン情報をご参照ください。'
                    }
                  ]
                }
              ]
            })
            
            console.log('Thread message posted:', threadMessage.ts)
          }
          
          console.log('✅ Successfully sent to Slack')
        } catch (slackError: any) {
          console.error('Slack API error:', slackError)
          console.error('Slack error details:', {
            message: slackError.message,
            data: slackError.data,
            code: slackError.code
          })
          throw slackError
        }
      } catch (error: any) {
        console.error('Slack notification error:', error)
        console.error('Error stack:', error.stack)
        // Slackエラーでも処理を続行
      }
    }
    
    // Resend APIを使用してメール送信
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      throw new Error('Email service not configured')
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [to],
      subject: isAdmin ? '新しいお問い合わせがありました' : 'お問い合わせありがとうございます',
      text: content,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, emailId: data?.id })
  } catch (error: any) {
    console.error('Error in send-email:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}