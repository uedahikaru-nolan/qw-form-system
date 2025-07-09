import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { WebClient } from '@slack/web-api'

export async function POST(request: NextRequest) {
  try {
    const { to, content, isAdmin } = await request.json()
    
    // 開発環境では、コンソールに出力
    console.log('=== メール送信内容 ===')
    console.log('宛先:', to)
    console.log('管理者メール:', isAdmin)
    console.log('内容:')
    console.log(content)
    console.log('======================')
    
    // 開発環境でテストモードの場合はメール送信をスキップ
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_EMAIL === 'true') {
      console.log('開発環境でSKIP_EMAIL=trueのため、メール送信をスキップしました')
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
        
        // メインメッセージを送信
        try {
          const mainMessage = await slack.chat.postMessage({
            channel: process.env.SLACK_CHANNEL_ID,
            text: `<!channel> 【${companyName}】様よりフォームが入力されました！`,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `<!channel> 【${companyName}】様よりフォームが入力されました！`
                }
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `*📅 送信日時*\n${new Date().toLocaleString('ja-JP')}`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*🌐 サイトタイプ*\n${formData['サイトタイプ'] || formData['サイト種別'] || '未指定'}`
                  }
                ]
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*👤 お客様*: ${formData['会社名'] || formData['ご担当者名'] || formData['お名前'] || formData['ご担当者様のお名前'] || '未入力'}\n*📧 メール*: ${formData['メールアドレス'] || formData['email'] || '未入力'}`
                }
              },
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: 'Notionで詳細を確認',
                      emoji: true
                    },
                    url: 'https://www.notion.so/2185b8517dea80e8a10ec20da021e84d?v=2185b8517dea80c5adfe000c2b228e85&source=copy_link',
                    style: 'primary'
                  }
                ]
              }
            ]
          })
          
          console.log('Main message sent:', mainMessage.ok ? 'Success' : 'Failed')
          
          // スレッドに詳細内容を投稿
          if (mainMessage.ok && mainMessage.ts) {
            console.log('Posting thread message with ts:', mainMessage.ts)
            
            const threadMessage = await slack.chat.postMessage({
              channel: process.env.SLACK_CHANNEL_ID,
              thread_ts: mainMessage.ts,
              text: 'フォーム詳細内容',
              blocks: [
                {
                  type: 'header',
                  text: {
                    type: 'plain_text',
                    text: '📋 フォーム詳細内容',
                    emoji: true
                  }
                },
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `\`\`\`${content}\`\`\``
                  }
                }
              ]
            })
            
            console.log('Thread message sent:', threadMessage.ok ? 'Success' : 'Failed')
            console.log('Slack通知送信成功（メインメッセージとスレッドに投稿）')
          } else {
            console.error('Failed to send main message or get timestamp')
          }
        } catch (apiError: any) {
          console.error('Slack API Error:', apiError.message)
          if (apiError.data) {
            console.error('Error details:', apiError.data)
          }
          throw apiError
        }
      } catch (slackError) {
        console.error('Slack送信エラー:', slackError)
        // Slackエラーでもメール送信は続行
      }
    }
    
    // Resend APIキーが設定されている場合のみメール送信
    if (process.env.RESEND_API_KEY) {
      console.log('Resend API key found, attempting to send email...')
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      const emailConfig = isAdmin ? {
        from: 'AIサイト作成フォーム <onboarding@resend.dev>',
        to: to.includes(',') ? to.split(',').map((email: string) => email.trim()) : [to],
        subject: `【AIサイト作成フォーム】新規送信内容 - ${new Date().toLocaleDateString('ja-JP')}`,
        text: content,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">AIサイト作成フォーム 送信内容</h2>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
              <pre style="font-family: monospace; white-space: pre-wrap; margin: 0;">${content}</pre>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              このメールは自動送信されました。
            </p>
          </div>
        `
      } : {
        from: 'AIサイト作成フォーム <onboarding@resend.dev>',
        to: to.includes(',') ? to.split(',').map((email: string) => email.trim()) : [to],
        subject: 'AIサイト作成フォーム - お申し込みありがとうございます',
        text: content,
        html: `
          <div style="font-family: 'Hiragino Sans', 'メイリオ', sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.7;">
            <div style="background-color: #1e40af; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">AIサイト作成サービス</h1>
            </div>
            
            <div style="padding: 40px 30px; background-color: #f8f9fa;">
              <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #1e40af; margin-bottom: 20px;">お申し込みありがとうございます</h2>
                
                <div style="margin-bottom: 30px;">
                  <pre style="font-family: 'Hiragino Sans', 'メイリオ', sans-serif; white-space: pre-wrap; margin: 0; line-height: 1.7;">${content}</pre>
                </div>
                
                <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-top: 30px;">
                  <p style="margin: 0; color: #92400e; font-weight: bold;">
                    📌 完成まで今しばらくお待ちください
                  </p>
                </div>
              </div>
              
              <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px;">
                このメールは自動送信されています。<br>
                ご不明な点がございましたら、このメールに返信してお問い合わせください。
              </p>
            </div>
          </div>
        `
      }
      
      const { data, error } = await resend.emails.send(emailConfig)
      
      if (error) {
        console.error('Resend error:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        throw error
      }
      
      console.log('メール送信成功:', data)
    } else {
      console.log('RESEND_API_KEYが設定されていないため、メール送信をスキップしました')
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Email send error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    // エラーの詳細をクライアントに返す（開発環境のみ）
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message || 'Failed to send email'
      : 'Failed to send email'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}