'use client'

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChatMessage, SiteType, SiteInfo } from '@/types'

// 基本的な質問の流れを定義（AIが参考にする）
const QUESTIONS_BY_TYPE: Record<SiteType, string[]> = {
  HP: [
    '店舗名・会社名を教えてください。',
    '住所（地図に載せたい場合は詳細に）を教えてください。',
    '電話番号・予約用の連絡先はありますか？',
    '営業時間と定休日を教えてください。',
    '提供するサービス・コンセプトを教えてください。',
    'メニュー内容を載せますか？もしあれば代表的なメニューを教えてください。',
    '写真は用意できますか？',
    '予約フォームは必要ですか？',
    'SNSアカウントがあれば送ってください。',
    'こだわりポイントやストーリーがあれば教えてください。'
  ],
  LP: [
    'サービス・商品名を教えてください。',
    'ターゲット層を教えてください。',
    '解決したい課題は何ですか？',
    '主な特徴・メリットを3つ教えてください。',
    '料金プランはありますか？',
    'お客様の声や実績はありますか？',
    'CTA（コンバージョンポイント）は何ですか？',
    '期間限定キャンペーンはありますか？'
  ],
  PORTFOLIO: [
    'お名前・活動名を教えてください。',
    '職種・専門分野を教えてください。',
    'スキル・使用ツールを教えてください。',
    '掲載したい作品数はいくつですか？',
    '各作品の説明は必要ですか？',
    '経歴・プロフィールを載せますか？',
    '連絡先・SNSリンクを教えてください。'
  ],
  WEBSYSTEM: [
    'システム名を教えてください。',
    '主な機能を教えてください。',
    '想定ユーザー数を教えてください。',
    'ログイン機能は必要ですか？',
    'データベースで管理する情報を教えてください。',
    '外部サービスとの連携はありますか？',
    'セキュリティ要件はありますか？'
  ]
}

function ChatPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const siteType = searchParams.get('type') as SiteType
  const industry = searchParams.get('industry') || ''
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({
    type: siteType,
    industry: industry,
    basicInfo: {}
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const questions = useMemo(() => QUESTIONS_BY_TYPE[siteType] || [], [siteType])

  const generateInitialGreeting = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [],
          siteType,
          industry,
          currentQuestion: 0
        })
      })

      if (response.ok) {
        const { response: aiResponse } = await response.json()
        const firstMessage: ChatMessage = {
          id: '1',
          role: 'assistant',
          content: aiResponse || `${industry}の${siteType === 'HP' ? 'ホームページ' : siteType === 'LP' ? 'ランディングページ' : siteType === 'PORTFOLIO' ? 'ポートフォリオサイト' : 'Webシステム'}を作成します。\n\nいくつか質問させていただきます。\n\n${questions[0]}`,
          timestamp: new Date()
        }
        setMessages([firstMessage])
      }
    } catch (error) {
      console.error('Initial greeting error:', error)
      // フォールバック
      const firstQuestion: ChatMessage = {
        id: '1',
        role: 'assistant',
        content: `${industry}の${siteType === 'HP' ? 'ホームページ' : siteType === 'LP' ? 'ランディングページ' : siteType === 'PORTFOLIO' ? 'ポートフォリオサイト' : 'Webシステム'}を作成します。\n\nいくつか質問させていただきます。\n\n${questions[0]}`,
        timestamp: new Date()
      }
      setMessages([firstQuestion])
    } finally {
      setIsLoading(false)
    }
  }, [siteType, industry, questions])

  useEffect(() => {
    if (messages.length === 0 && questions.length > 0) {
      // AIによる柔軟な最初の挨拶を生成
      generateInitialGreeting()
    }
  }, [messages.length, questions.length, generateInitialGreeting])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setUserInput('')
    setIsLoading(true)

    updateSiteInfo(currentQuestionIndex, userInput)

    try {
      // 全てのメッセージ履歴を含めてAPIに送信
      const allMessages = [...messages, userMessage]
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          siteType,
          industry,
          currentQuestion: currentQuestionIndex + 1
        })
      })

      if (!response.ok) {
        let errorData = {}
        try {
          errorData = await response.json()
        } catch (e) {
          console.error('Failed to parse error response:', e)
        }
        console.error('API Error:', { status: response.status, errorData })
        
        // 500エラーの場合（APIクォータエラーを含む）は特別なメッセージを表示
        if (response.status === 500) {
          const currentQuestion = questions[currentQuestionIndex] || '必要な情報を教えてください。'
          const questionNumber = currentQuestionIndex + 1
          const totalQuestions = questions.length
          const fallbackMessage = `申し訳ございません。現在AIサービスが一時的に利用できません。\n\n手動で情報を入力していただけます。\n\n**質問 ${questionNumber}/${totalQuestions}:**\n${currentQuestion}\n\n回答を入力して送信してください。すべての情報を入力後、右上の「制作をスタート」ボタンから次に進めます。`
          
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: fallbackMessage,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, aiMessage])
          setIsLoading(false)
          
          // 次の質問へ進む
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
          }
          return
        }
        
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
      
      const { response: aiResponse } = await response.json()
      
      // AIの応答を追加
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])

      // AIが「十分な情報が集まった」と判断した場合の処理
      if (aiResponse.includes('ありがとうございました') || 
          aiResponse.includes('十分な情報') || 
          aiResponse.includes('サイトの構成') ||
          currentQuestionIndex >= questions.length - 1) {
        // 情報収集が完了したら、要約画面へ
        setIsLoading(true)
        
        // 最終メッセージを表示
        const finalMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: '素晴らしい情報をいただきありがとうございました！\n\nいただいた情報を整理して、確認画面を表示します...',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, finalMessage])
        
        // チャット履歴を保存
        localStorage.setItem('chatHistory', JSON.stringify([...allMessages, aiMessage]))
        
        // siteInfoも保存
        if (siteInfo) {
          localStorage.setItem('siteInfo', JSON.stringify(siteInfo))
        }
        
        setTimeout(() => {
          router.push(`/summary?type=${siteType}&industry=${encodeURIComponent(industry)}`)
        }, 2000)
      } else {
        // まだ質問が続く場合
        setCurrentQuestionIndex(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '申し訳ございません。現在システムが利用できません。\n\n以下の情報を直接入力してください：\n' + (questions[currentQuestionIndex] || '必要な情報を教えてください。'),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const updateSiteInfo = (questionIndex: number, answer: string) => {
    const updatedInfo = { ...siteInfo }
    
    // AIが柔軟に情報を抽出できるように、ユーザーの回答を解析
    const answerLower = answer.toLowerCase()
    
    if (!updatedInfo.basicInfo) updatedInfo.basicInfo = {}
    
    // 回答から情報を抽出
    // 名称の抽出
    if (answer.includes('店') || answer.includes('会社') || answer.includes('名')) {
      const nameMatch = answer.match(/[「『]?([^」』。、]+)[」』]?(?:です|といいます|と申します)?/)
      if (nameMatch && nameMatch[1]) updatedInfo.basicInfo.name = nameMatch[1]
    }
    
    // 住所の抽出
    if (answer.includes('住所') || answer.includes('所在地') || answer.match(/[都道府県市区町村]/)) {
      updatedInfo.basicInfo.address = answer
    }
    
    // 電話番号の抽出
    const phoneMatch = answer.match(/\d{2,4}-\d{2,4}-\d{3,4}/)
    if (phoneMatch && phoneMatch[0]) {
      updatedInfo.basicInfo.phone = phoneMatch[0]
    }
    
    // 営業時間の抽出
    if (answer.includes('時') || answer.includes('営業')) {
      updatedInfo.basicInfo.businessHours = answer
    }
    
    // その他の情報も柔軟に保存
    const questionKeys = [
      'name', 'address', 'phone', 'businessHours', 'holidays',
      'concept', 'menu', 'photos', 'reservation', 'sns', 'specialFeatures'
    ]
    
    if (questionKeys[questionIndex]) {
      const key = questionKeys[questionIndex] as keyof typeof updatedInfo.basicInfo
      
      if (key === 'photos' || key === 'reservation') {
        // boolean型のフィールド
        (updatedInfo.basicInfo as any)[key] = answerLower.includes('はい') || answerLower.includes('yes') || answerLower.includes('お願い')
      } else {
        // string型のフィールド
        (updatedInfo.basicInfo as any)[key] = answer
      }
    }
    
    setSiteInfo(updatedInfo)
    localStorage.setItem('siteInfo', JSON.stringify(updatedInfo))
  }

  const handleQuickAnswer = (answer: string) => {
    setUserInput(answer)
  }

  const handleStartCreation = () => {
    // 現在のチャット履歴を保存
    localStorage.setItem('chatHistory', JSON.stringify(messages))
    
    // siteInfoがある場合は保存
    if (siteInfo && Object.keys(siteInfo.basicInfo || {}).length > 0) {
      localStorage.setItem('siteInfo', JSON.stringify(siteInfo))
    } else {
      // siteInfoがない場合は削除（AIに抽出させる）
      localStorage.removeItem('siteInfo')
    }
    
    // 要約画面へ遷移
    router.push(`/summary?type=${siteType}&industry=${encodeURIComponent(industry)}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 制作スタートボタン（フローティング） */}
      {messages.length > 2 && (
        <button
          onClick={handleStartCreation}
          className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 transition-all z-50 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          制作をスタート
        </button>
      )}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-800">
                {industry}の{siteType === 'HP' ? 'ホームページ' : siteType}作成
              </h1>
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  質問 {currentQuestionIndex + 1} / {questions.length}
                </p>
              </div>
            </div>
            {/* モバイル用制作スタートボタン */}
            {messages.length > 2 && (
              <button
                onClick={handleStartCreation}
                className="md:hidden bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                制作へ
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4">
        <div className="bg-white rounded-lg shadow h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {(currentQuestionIndex === 2 || currentQuestionIndex === 6 || currentQuestionIndex === 7) && (
            <div className="px-6 pb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => handleQuickAnswer('はい')}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                >
                  はい
                </button>
                <button
                  onClick={() => handleQuickAnswer('いいえ')}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                >
                  いいえ
                </button>
              </div>
            </div>
          )}

          {currentQuestionIndex === 4 && siteType === 'HP' && (
            <div className="px-6 pb-2">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleQuickAnswer('イタリアン')}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                >
                  イタリアン
                </button>
                <button
                  onClick={() => handleQuickAnswer('和食')}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                >
                  和食
                </button>
                <button
                  onClick={() => handleQuickAnswer('カフェ')}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                >
                  カフェ
                </button>
                <button
                  onClick={() => handleQuickAnswer('中華')}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                >
                  中華
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="回答を入力してください..."
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                送信
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-xl text-gray-600">ページを読み込み中...</p>
      </div>
    </div>}>
      <ChatPageContent />
    </Suspense>
  )
}