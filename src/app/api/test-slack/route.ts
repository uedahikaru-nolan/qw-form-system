import { NextResponse } from 'next/server'
import { WebClient } from '@slack/web-api'

export async function GET() {
  try {
    if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_CHANNEL_ID) {
      return NextResponse.json(
        { error: 'Slack設定が見つかりません。環境変数を確認してください。' },
        { status: 500 }
      )
    }
    
    // Slack Web APIクライアントの初期化
    const slack = new WebClient(process.env.SLACK_BOT_TOKEN)
    
    // メインメッセージを送信
    const mainMessage = await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      text: '<!channel> 【テスト会社】様よりフォームが入力されました！',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '<!channel> 【テスト会社】様よりフォームが入力されました！'
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
              text: '*🌐 サイトタイプ*\nHP'
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*👤 お客様*: テスト会社\n*📧 メール*: test@example.com'
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
    
    // スレッドにテスト詳細を投稿
    if (mainMessage.ts) {
      await slack.chat.postMessage({
        channel: process.env.SLACK_CHANNEL_ID,
        thread_ts: mainMessage.ts,
        text: 'テストフォーム詳細内容',
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
              text: '```' +
                'サイトタイプ: HP\n' +
                '業界: IT・テクノロジー\n' +
                '会社名: テスト会社\n' +
                'ご担当者様のお名前: テスト太郎\n' +
                'メールアドレス: test@example.com\n' +
                '電話番号: 03-1234-5678\n\n' +
                '【ご要望内容】\n' +
                'これはテストメッセージです。\n' +
                'スレッド機能が正常に動作することを確認しています。' +
                '```'
            }
          }
        ]
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Slack通知を送信しました（スレッドに詳細も投稿）。Slackチャンネルを確認してください。' 
    })
  } catch (error: any) {
    console.error('Slack test error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send test notification' },
      { status: 500 }
    )
  }
}