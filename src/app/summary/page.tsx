'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChatMessage } from '@/types'
import EditableSummary from '@/components/summary/EditableSummary'

function SummaryPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const siteType = searchParams.get('type') || 'HP'
  const industry = searchParams.get('industry') || ''
  
  const [summary, setSummary] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  
  // APIが利用できない場合のフォールバック要約生成
  const generateFallbackSummary = (chatHistory: any[], siteType: string, industry: string) => {
    const siteTypeLabel = siteType === 'HP' ? 'ホームページ' : 
                         siteType === 'LP' ? 'ランディングページ' : 
                         siteType === 'PORTFOLIO' ? 'ポートフォリオサイト' : 'Webシステム'
    
    let summary = `## 📋 収集した情報のまとめ\n\n`
    summary += `### 基本情報\n`
    summary += `- サイトタイプ: ${siteTypeLabel}\n`
    summary += `- 業種: ${industry}\n\n`
    
    summary += `### チャット履歴\n`
    chatHistory.forEach((msg: any) => {
      if (msg.role === 'user') {
        summary += `- ユーザー: ${msg.content}\n`
      }
    })
    
    summary += `\n## 🏗️ ${siteTypeLabel}構成の提案\n\n`
    summary += `### 推奨ページ構成\n`
    
    if (siteType === 'HP') {
      summary += `- **ホーム** - サイトの顔となるメインページ\n`
      summary += `- **${industry}について** - 事業内容や理念を紹介\n`
      summary += `- **サービス・商品** - 提供内容の詳細\n`
      summary += `- **お問い合わせ** - 連絡先とお問い合わせフォーム\n`
    } else if (siteType === 'LP') {
      summary += `- **ファーストビュー** - キャッチコピーとメインビジュアル\n`
      summary += `- **課題提起** - ターゲットの悩みに共感\n`
      summary += `- **解決策** - サービス・商品の特徴\n`
      summary += `- **申込み** - フォームとCTA\n`
    } else if (siteType === 'PORTFOLIO') {
      summary += `- **トップ** - 自己紹介とスキル\n`
      summary += `- **作品集** - ポートフォリオギャラリー\n`
      summary += `- **プロフィール** - 経歴と実績\n`
      summary += `- **コンタクト** - お問い合わせ方法\n`
    } else {
      summary += `- **ダッシュボード** - メイン画面\n`
      summary += `- **機能ページ** - システムの各機能\n`
      summary += `- **設定** - ユーザー設定と管理\n`
    }
    
    return summary
  }

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const chatHistory = localStorage.getItem('chatHistory')
        if (!chatHistory) {
          setError('チャット履歴が見つかりません')
          return
        }

        const history = JSON.parse(chatHistory) as ChatMessage[]

        const response = await fetch('/api/summarize-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatHistory: history,
            siteType,
            industry
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Summary API Error:', errorData)
          
          // APIクォータエラーの場合は、チャット履歴から簡易的な要約を生成
          if (response.status === 500 && errorData.error) {
            const parsedHistory = JSON.parse(chatHistory)
            const fallbackSummary = generateFallbackSummary(parsedHistory, siteType, industry)
            setSummary(fallbackSummary)
            return
          }
          
          throw new Error('要約の生成に失敗しました')
        }

        const { summary } = await response.json()
        setSummary(summary)
      } catch (error) {
        console.error('Summary error:', error)
        // エラー時もフォールバック要約を生成
        const storedChatHistory = localStorage.getItem('chatHistory')
        if (storedChatHistory) {
          const parsedHistory = JSON.parse(storedChatHistory)
          const fallbackSummary = generateFallbackSummary(parsedHistory, siteType, industry)
          setSummary(fallbackSummary)
        } else {
          setError('情報の整理中にエラーが発生しました')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadSummary()
  }, [siteType, industry])


  const handleProceed = async () => {
    setIsProcessing(true)
    
    try {
      // メール送信用のデータを準備
      const siteInfo = localStorage.getItem('siteInfo')
      const chatHistory = localStorage.getItem('chatHistory')
      const dataToSend = {
        type: siteType,
        industry: industry,
        summary: summary,
        basicInfo: siteInfo ? JSON.parse(siteInfo).basicInfo : {},
        timestamp: new Date().toISOString(),
        chatHistory: chatHistory ? JSON.parse(chatHistory) : []
      }
      
      // メール本文を生成
      const emailContent = generateEmailContent(dataToSend)
      
      // 管理者へのメール送信（ユーザー情報も含む）
      const adminResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'h_ueda@nolan.co.jp,qw-form-notification-aaaaqumooqghb4dkaivgoquwfi@nolan-co-jp.slack.com',
          content: emailContent,
          isAdmin: true
        })
      })
      
      if (!adminResponse.ok) {
        const errorData = await adminResponse.json()
        console.error('Admin email error:', errorData)
        alert(`メール送信に失敗しました: ${errorData.error || 'Unknown error'}`)
        setIsProcessing(false)
        return
      }
      
      // ユーザーへのメール送信（Resend無料プランの制限のため省略）
      // 本番環境では独自ドメインを設定後、以下のコメントを解除してください
      /*
      const userResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: userEmail,
          content: generateUserEmailContent(dataToSend),
          isAdmin: false
        })
      })
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json()
        console.error('User email error:', errorData)
        // ユーザーへのメール送信失敗は警告のみ（管理者には送信済み）
        console.warn('ユーザーへのメール送信に失敗しましたが、管理者への送信は完了しています')
      }
      */
      
      // 管理者への送信が成功したら完了画面へ遷移
      router.push('/complete')
    } catch (error) {
      console.error('Send error:', error)
      alert('エラーが発生しました。')
      setIsProcessing(false)
    }
  }
  
  const generateEmailContent = (data: any): string => {
    let content = '=== AIサイト作成フォーム 要約情報 ===\n\n'
    content += `作成日時: ${data.timestamp}\n`
    content += `サイトタイプ: ${data.type}\n`
    content += `業種: ${data.industry}\n\n`
    
    content += '【AIによる要約・提案内容】\n'
    content += data.summary
    content += '\n\n'
    
    // チャット履歴を追加
    if (data.chatHistory && data.chatHistory.length > 0) {
      content += '=== チャット履歴 ===\n\n'
      data.chatHistory.forEach((message: any) => {
        const role = message.role === 'assistant' ? 'AI' : 'ユーザー'
        const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleString('ja-JP') : ''
        
        content += `【${role}】${timestamp ? ` (${timestamp})` : ''}\n`
        content += `${message.content}\n`
        content += '---\n\n'
      })
    }
    
    return content
  }
  
  // ユーザーへのメール送信機能は、Resendの無料プランの制限により一時的に無効化
  // 本番環境では独自ドメインを設定後、この関数を使用してください
  /*
  const generateUserEmailContent = (data: any): string => {
    let content = `${data.industry}様\n\n`
    content += 'この度は、AIサイト作成フォームをご利用いただきありがとうございます。\n'
    content += 'お客様の情報を受け付けました。\n\n'
    
    content += '【ご入力いただいた内容】\n'
    content += `サイトタイプ: ${data.type === 'HP' ? 'ホームページ' : data.type === 'LP' ? 'ランディングページ' : data.type === 'PORTFOLIO' ? 'ポートフォリオサイト' : 'Webシステム'}\n`
    content += `業種: ${data.industry}\n\n`
    
    content += '現在、AIがお客様の情報を基にサイト構成を作成しております。\n'
    content += '完成まで今しばらくお待ちください。\n\n'
    
    content += '進捗状況や追加のご質問がございましたら、\n'
    content += 'このメールに返信する形でお問い合わせください。\n\n'
    
    content += '引き続きよろしくお願いいたします。\n\n'
    
    content += '---\n'
    content += 'AIサイト作成サービス\n'
    
    return content
  }
  */

  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">AIが情報を整理しています...</p>
          <p className="text-sm text-gray-500 mt-2">もう少しお待ちください</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 relative">
      {/* ローディングオーバーレイ */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl font-semibold text-gray-800">メールを送信しています...</p>
            <p className="text-sm text-gray-600 mt-2">もう少しお待ちください</p>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-2">
            情報の整理が完了しました
          </h1>
          <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-8">
            以下の内容で{industry}の{siteType === 'HP' ? 'ホームページ' : siteType === 'LP' ? 'ランディングページ' : siteType === 'PORTFOLIO' ? 'ポートフォリオサイト' : 'Webシステム'}を作成します
          </p>
        </div>


        <EditableSummary 
          summary={summary}
          onUpdate={(updatedSummary) => setSummary(updatedSummary)}
          disabled={isProcessing}
        />

        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8">

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 md:pt-6 border-t">
            <button
              onClick={handleBack}
              className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2 text-sm md:text-base border md:border-0 rounded-lg md:rounded-none"
            >
              <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              チャットに戻る
            </button>
            
            <button
              onClick={handleProceed}
              disabled={isProcessing}
              className={`w-full md:w-auto px-6 md:px-8 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all text-sm md:text-base ${
                isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  送信中...
                </>
              ) : (
                <>
                  メールで送信する
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 md:mt-6 text-center text-xs md:text-sm text-gray-500 px-4">
          ※ メールにはAIが整理した情報と提案内容が含まれます
        </div>
      </div>
    </div>
  )
}

export default function SummaryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-xl text-gray-600">ページを読み込み中...</p>
      </div>
    </div>}>
      <SummaryPageContent />
    </Suspense>
  )
}