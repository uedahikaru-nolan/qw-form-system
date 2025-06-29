'use client'

import { useState, useEffect } from 'react'

export default function AISummaryView() {
  const [summary, setSummary] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // localStorageから要約を取得
    const storedSummary = localStorage.getItem('siteSummary')
    if (storedSummary) {
      setSummary(storedSummary)
    } else {
      setSummary('要約がまだ作成されていません。')
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // 要約をセクションごとに分割して表示
  const formatSummary = (text: string) => {
    const sections = text.split(/(?=##\s)/)
    
    return sections.map((section, index) => {
      if (!section.trim()) return null
      
      const lines = section.split('\n')
      const title = lines[0]?.replace(/^##\s/, '')
      const content = lines.slice(1).join('\n')
      
      return (
        <div key={index} className="mb-8">
          {title && (
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              {title.includes('収集した情報') && (
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {title.includes('構成の提案') && (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )}
              {title}
            </h3>
          )}
          <div className="prose prose-gray max-w-none">
            {content.split('\n').map((line, lineIndex) => {
              if (!line.trim()) return null
              
              // サブセクション (###)
              if (line.startsWith('###')) {
                return (
                  <h4 key={lineIndex} className="text-lg font-semibold mt-4 mb-2 text-gray-700">
                    {line.replace(/^###\s/, '')}
                  </h4>
                )
              }
              
              // リストアイテム (-)
              if (line.startsWith('-')) {
                return (
                  <p key={lineIndex} className="ml-4 mb-2 flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span className="text-gray-700">{line.substring(1).trim()}</span>
                  </p>
                )
              }
              
              // 通常のテキスト
              return (
                <p key={lineIndex} className="mb-2 text-gray-700">
                  {line}
                </p>
              )
            })}
          </div>
        </div>
      )
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">AIからの提案内容</h2>
        <p className="text-gray-600">
          チャットの内容を基にAIが整理・提案した内容です
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        {formatSummary(summary)}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          この提案内容は、要約画面で編集した内容が反映されています
        </p>
      </div>
    </div>
  )
}