'use client'

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChatMessage, SiteType, SiteInfo } from '@/types'

// 基本的な質問の流れを定義（AIが参考にする）
const QUESTIONS_BY_TYPE: Record<SiteType, string[]> = {
  HP: [
    '会社名（屋号）を教えてください（あれば）',
    'サービス名を教えてください（あれば）',
    'ご担当者様のお名前を教えてください（必須）',
    'メールアドレスを教えてください（必須）',
    '電話番号を教えてください（任意）',
    '業種を教えてください',
    'コンセプトやVMV（Vision、Mission、Value）があれば教えてください',
    'サイトのイメージカラーを教えてください',
    '現在のサイトURL（あれば）',
    '参考にしたいサイトURL（任意・複数可）',
    'サイトに載せたい主な内容を教えてください（例：サービス紹介、料金表、会社情報など）',
    'ご希望のページ数（おおよそで可）',
    '納期の希望時期はありますか？',
    'その他ご要望があれば教えてください'
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
  
  const hasInitialFormData = siteType === 'HP' && typeof window !== 'undefined' && localStorage.getItem('initialFormData') !== null
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false) // 常にfalseで開始
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({
    type: siteType,
    industry: industry,
    basicInfo: {}
  })
  const [isInitialized, setIsInitialized] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
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

  // フォームデータ付きの初期挨拶生成
  const generateInitialGreetingWithFormData = useCallback(async (formDataSummary: any[]) => {
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
          currentQuestion: 0,
          formDataSummary: formDataSummary  // フォームデータを送信
        })
      })

      if (response.ok) {
        const { response: aiResponse } = await response.json()
        const firstMessage: ChatMessage = {
          id: '1',
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        }
        setMessages([firstMessage])
        
        // フォームデータをチャット履歴として追加
        let messageId = 2
        const newMessages: ChatMessage[] = [firstMessage]
        
        formDataSummary.forEach((item) => {
          // AI質問
          newMessages.push({
            id: messageId.toString(),
            role: 'assistant',
            content: `${item.label}を教えてください`,
            timestamp: new Date()
          })
          messageId++
          
          // ユーザー回答
          newMessages.push({
            id: messageId.toString(),
            role: 'user',
            content: item.value,
            timestamp: new Date()
          })
          messageId++
        })
        
        setMessages(newMessages)
        setCurrentQuestionIndex(questions.length) // すべての質問完了
        
        // 少し遅延を入れてから、まとめメッセージを送信
        setTimeout(async () => {
          setIsLoading(true)
          try {
            // まとめメッセージを生成
            const summaryResponse = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                siteType,
                industry,
                currentQuestion: questions.length,
                isFormDataProvided: true  // 提案モードを有効化
              })
            })

            if (summaryResponse.ok) {
              const { response: summaryMessage } = await summaryResponse.json()
              setMessages(prev => [...prev, {
                id: (prev.length + 1).toString(),
                role: 'assistant',
                content: summaryMessage,
                timestamp: new Date()
              }])
            }
          } catch (error) {
            console.error('Summary generation error:', error)
          } finally {
            setIsLoading(false)
          }
        }, 1500) // 1.5秒後にまとめメッセージを送信
      }
    } catch (error) {
      console.error('Initial greeting error:', error)
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `${industry}のホームページ作成をサポートさせていただきます。`,
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }, [siteType, industry, questions.length])

  useEffect(() => {
    if (!isInitialized && messages.length === 0 && questions.length > 0) {
      setIsInitialized(true)
      
      // HPタイプの場合、初期フォームデータを確認
      if (siteType === 'HP') {
        const initialFormData = localStorage.getItem('initialFormData')
        if (initialFormData) {
          const formData = JSON.parse(initialFormData)
          
          // フィールド定義
          const fields = [
            { key: 'companyName', label: '会社名（屋号）' },
            { key: 'serviceName', label: 'サービス名' },
            { key: 'contactPerson', label: 'ご担当者様のお名前' },
            { key: 'email', label: 'メールアドレス' },
            { key: 'phone', label: '電話番号' },
            { key: 'industry', label: '業種' },
            { key: 'conceptVMV', label: 'コンセプト・VMV' },
            { key: 'themeColor', label: 'サイトのイメージカラー' },
            { key: 'currentSiteUrl', label: '現在のサイトURL' },
            { key: 'referenceUrls', label: '参考にしたいサイトURL' },
            { key: 'mainContents', label: 'サイトに載せたい主な内容' },
            { key: 'pageCount', label: 'ご希望のページ数' },
            { key: 'deadline', label: '納期の希望時期' },
            { key: 'otherRequests', label: 'その他ご要望' }
          ]
          
          // フォームデータの整理
          const formDataSummary: any[] = []
          fields.forEach((field, index) => {
            const value = formData[field.key]
            if (value && (Array.isArray(value) ? value.filter((v: string) => v).length > 0 : value.trim())) {
              const displayValue = Array.isArray(value) ? value.filter((v: string) => v).join('\n') : value
              formDataSummary.push({
                label: field.label,
                value: displayValue
              })
              // siteInfoを更新
              updateSiteInfo(index, displayValue)
            }
          })
          
          // フォームデータをクリア
          localStorage.removeItem('initialFormData')
          
          // AIに最初の挨拶を生成させる
          setIsLoading(true)
          generateInitialGreetingWithFormData(formDataSummary)
          return
        }
      }
      
      // 通常のAI挨拶
      generateInitialGreeting()
    }
  }, [messages.length, questions.length, generateInitialGreeting, generateInitialGreetingWithFormData, siteType, industry, isInitialized])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // テキストエリアの高さを内容に合わせて自動調整
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [userInput])

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
    
    if (!updatedInfo.basicInfo) updatedInfo.basicInfo = {}
    
    // HPタイプの新しい質問に対応
    if (siteType === 'HP') {
      const hpQuestionKeys = [
        'companyName',        // 会社名（屋号）
        'serviceName',        // サービス名
        'contactPerson',      // 担当者名
        'email',              // メールアドレス
        'phone',              // 電話番号
        'industry',           // 業種
        'conceptVMV',         // コンセプト・VMV
        'themeColor',         // イメージカラー
        'currentSiteUrl',     // 現在のサイトURL
        'referenceUrls',      // 参考サイトURL
        'mainContents',       // サイトに載せたい内容
        'pageCount',          // ページ数
        'deadline',           // 納期
        'otherRequests'       // その他要望
      ]
      
      if (hpQuestionKeys[questionIndex]) {
        const key = hpQuestionKeys[questionIndex] as keyof typeof updatedInfo.basicInfo
        (updatedInfo.basicInfo as any)[key] = answer
      }
    } else {
      // 他のサイトタイプ用の既存ロジック
      const questionKeys = [
        'name', 'address', 'phone', 'businessHours', 'holidays',
        'concept', 'menu', 'photos', 'reservation', 'sns', 'specialFeatures'
      ]
      
      if (questionKeys[questionIndex]) {
        const key = questionKeys[questionIndex] as keyof typeof updatedInfo.basicInfo
        const answerLower = answer.toLowerCase()
        
        if (key === 'photos' || key === 'reservation') {
          // boolean型のフィールド
          (updatedInfo.basicInfo as any)[key] = answerLower.includes('はい') || answerLower.includes('yes') || answerLower.includes('お願い')
        } else {
          // string型のフィールド
          (updatedInfo.basicInfo as any)[key] = answer
        }
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

      <main className="flex-1 w-full">
        <div className="flex h-full">
          {/* 左側のメッセージ */}
          {messages.length > 2 && (
            <div className="hidden lg:block w-64 bg-gray-50 border-r p-6">
              <div className="sticky top-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">ご案内</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    付け加えたい内容がありましたらいつでも私に相談ください。
                  </p>
                  <p className="text-sm text-blue-800">
                    内容がよければ制作スタートボタンを押してください。
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* メインチャットエリア */}
          <div className="flex-1 max-w-4xl mx-auto p-4 pb-24">
            <div className="bg-white rounded-lg shadow h-full">
              <div className="overflow-y-auto p-6 space-y-4">
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
            </div>
          </div>
        </div>
      </main>

      {/* フローティング入力フォーム */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto">
          {/* イメージカラーのクイック選択（HP質問7） */}
          {currentQuestionIndex === 7 && siteType === 'HP' && (
            <div className="px-6 pt-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleQuickAnswer('青系（信頼感・安心感）')}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                >
                  青系（信頼感・安心感）
                </button>
                <button
                  onClick={() => handleQuickAnswer('緑系（自然・安らぎ）')}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                >
                  緑系（自然・安らぎ）
                </button>
                <button
                  onClick={() => handleQuickAnswer('赤系（情熱・活力）')}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                >
                  赤系（情熱・活力）
                </button>
                <button
                  onClick={() => handleQuickAnswer('モノトーン（洗練・高級感）')}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                >
                  モノトーン（洗練・高級感）
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.shiftKey) {
                    // Shift+Enterで改行を許可
                    return
                  }
                }}
                placeholder="回答を入力してください..."
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:border-blue-500 resize-none overflow-hidden"
                style={{ minHeight: '52px', maxHeight: '200px' }}
                disabled={isLoading}
                rows={1}
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
      </div>
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