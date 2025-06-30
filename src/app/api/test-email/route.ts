import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing email configuration...')
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length)
    console.log('RESEND_API_KEY prefix:', process.env.RESEND_API_KEY?.substring(0, 5))
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY is not set',
        exists: false 
      })
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    // テストメール送信
    const { data, error } = await resend.emails.send({
      from: 'AIサイト作成フォーム <onboarding@resend.dev>',
      to: ['h_ueda@nolan.co.jp', 'qw-form-notification-aaaaqumooqghb4dkaivgoquwfi@nolan-co-jp.slack.com'],
      subject: 'テストメール - AIサイト作成フォーム',
      text: 'これはテストメールです。正常に動作しています。',
      html: '<p>これは<strong>テストメール</strong>です。正常に動作しています。</p>'
    })
    
    if (error) {
      console.error('Test email error:', error)
      return NextResponse.json({ 
        error: error.message || 'Unknown error',
        details: error 
      }, { status: 400 })
    }
    
    console.log('Test email sent successfully:', data)
    return NextResponse.json({ 
      success: true,
      data: data,
      message: 'Test email sent successfully' 
    })
    
  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      error: error.message || 'Unknown error',
      stack: error.stack 
    }, { status: 500 })
  }
}