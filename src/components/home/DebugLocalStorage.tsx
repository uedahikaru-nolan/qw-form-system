'use client'

import { useEffect, useState } from 'react'
import { extractPagesFromSummary } from '@/lib/extractPagesFromSummary'

export default function DebugLocalStorage() {
  const [storageData, setStorageData] = useState<any>({})
  const [extractedPages, setExtractedPages] = useState<any[]>([])
  const [testResults, setTestResults] = useState<string>('')

  useEffect(() => {
    const summary = localStorage.getItem('siteSummary')
    const siteInfo = localStorage.getItem('siteInfo')
    const generatedContent = localStorage.getItem('generatedContent')
    
    setStorageData({
      summary: summary ? summary.substring(summary.length - 1000) : 'なし',  // 最後の1000文字を表示
      summaryLength: summary ? summary.length : 0,
      siteInfo: siteInfo ? JSON.parse(siteInfo) : 'なし',
      generatedContent: generatedContent ? JSON.parse(generatedContent) : 'なし'
    })
    
    if (summary) {
      // パターンテスト
      const testPattern = /^-\s*\*\*(.+?)\*\*/gm
      const matches = []
      let match
      while ((match = testPattern.exec(summary)) !== null) {
        matches.push(match[1])
      }
      setTestResults(`パターンマッチ結果: ${matches.join(', ')}`)
      
      const pages = extractPagesFromSummary(summary)
      setExtractedPages(pages)
    }
  }, [])

  return (
    <div className="fixed bottom-20 left-4 bg-white border rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-auto z-50">
      <h3 className="font-bold mb-2">デバッグ情報</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">LocalStorage内容:</h4>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(storageData, null, 2)}
        </pre>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold">パターンテスト:</h4>
        <p className="text-xs bg-yellow-100 p-2 rounded">{testResults}</p>
      </div>
      
      <div>
        <h4 className="font-semibold">抽出されたページ ({extractedPages.length}件):</h4>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(extractedPages, null, 2)}
        </pre>
      </div>
    </div>
  )
}