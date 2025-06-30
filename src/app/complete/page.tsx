'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CompletePage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [referenceUrls, setReferenceUrls] = useState<string[]>([])

  useEffect(() => {
    // ユーザーメールアドレスを取得
    const email = localStorage.getItem('userEmail')
    if (email) {
      setUserEmail(email)
    }
    
    // 参考URLを取得
    const urls = localStorage.getItem('referenceUrls')
    if (urls) {
      try {
        setReferenceUrls(JSON.parse(urls))
      } catch (error) {
        console.error('Failed to parse reference URLs:', error)
      }
    }
    
    // Clear local storage
    localStorage.removeItem('chatHistory')
    localStorage.removeItem('siteInfo')
    localStorage.removeItem('siteSummary')
    localStorage.removeItem('generatedContent')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('referenceUrls')
  }, [])

  const handleNewRequest = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg 
              className="w-10 h-10 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            送信ありがとうございます。
          </h1>
          
          <div className="text-gray-600 mb-8 text-left">
            <p className="mb-6">
              このたびは弊社ヒアリングフォームへご入力いただき、誠にありがとうございます。<br />
              ご入力いただいた内容を確認のうえ、3営業日以内に担当者よりご連絡させていただきます。
            </p>

            <div className="mb-6">
              <h2 className="font-semibold mb-2">■ ご入力内容</h2>
              {referenceUrls.length > 0 && (
                <div className="mb-2">
                  参考サイト：
                  {referenceUrls.map((url, index) => (
                    <div key={index} className="ml-4">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{url}</a>
                    </div>
                  ))}
                </div>
              )}
              {userEmail && (
                <div>
                  ご連絡先メールアドレス： <span className="font-medium">{userEmail}</span>
                </div>
              )}
            </div>

            <div>
              <h2 className="font-semibold mb-2">■ 今後の流れ</h2>
              <div className="ml-4">
                <p className="mb-1">内容確認（1営業日）</p>
                <p>担当者よりご連絡・追加ヒアリング（1～2営業日）</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleNewRequest}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              新しいサイトを作成する
            </button>
            
            <button
              onClick={() => window.close()}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          ご利用ありがとうございました
        </p>
      </div>
    </div>
  )
}