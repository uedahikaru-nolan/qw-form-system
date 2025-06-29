import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

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
    
    // Resend APIキーが設定されている場合のみメール送信
    if (process.env.RESEND_API_KEY) {
      console.log('Resend API key found, attempting to send email...')
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      const emailConfig = isAdmin ? {
        from: 'AIサイト作成フォーム <onboarding@resend.dev>',
        to: [to],
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
        to: [to],
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