'use client'

import { useState, useEffect } from 'react'
import { SiteInfo, PageInfo } from '@/types'
import Sidebar from '@/components/home/Sidebar'
import PageEditor from '@/components/home/PageEditor'
import BasicInfoEditor from '@/components/home/BasicInfoEditor'
import ChatHistory from '@/components/home/ChatHistory'
import AISummaryView from '@/components/home/AISummaryView'
import { generateSiteContent, calculateOverallCompletion } from '@/lib/siteGenerator'
import { extractPagesFromSummary } from '@/lib/extractPagesFromSummary'

export default function HomePage() {
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null)
  const [pages, setPages] = useState<PageInfo[]>([])
  const [currentPageId, setCurrentPageId] = useState('basic-info')
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadAndProcessData = async () => {
      const generatedContent = localStorage.getItem('generatedContent')
      const savedInfo = localStorage.getItem('siteInfo')
      const chatHistory = localStorage.getItem('chatHistory')
      
      // AIが生成したコンテンツがある場合
      if (generatedContent) {
        try {
          const content = JSON.parse(generatedContent)
          
          // 基本情報を設定
          if (content.basicInfo) {
            const updatedSiteInfo = {
              type: savedInfo ? JSON.parse(savedInfo).type : 'HP',
              industry: savedInfo ? JSON.parse(savedInfo).industry : '',
              basicInfo: content.basicInfo
            }
            setSiteInfo(updatedSiteInfo)
            localStorage.setItem('siteInfo', JSON.stringify(updatedSiteInfo))
          }
          
          // ページ構成を設定
          if (content.pages) {
            setPages(content.pages)
          } else {
            // ページがない場合は要約から抽出を試みる
            const summary = localStorage.getItem('siteSummary')
            if (summary) {
              const extractedPages = extractPagesFromSummary(summary)
              setPages(extractedPages)
            } else {
              setPages([])
            }
          }
          
          // 使用済みのデータを削除
          localStorage.removeItem('generatedContent')
          return
        } catch (error) {
          console.error('Failed to load generated content:', error)
        }
      }
      
      // 保存されたsiteInfoからページを生成
      if (savedInfo) {
        const parsedInfo = JSON.parse(savedInfo)
        setSiteInfo(parsedInfo)
        
        // 要約からページ構成を抽出
        const summary = localStorage.getItem('siteSummary')
        console.log('Summary from localStorage:', summary)
        if (summary) {
          const extractedPages = extractPagesFromSummary(summary)
          console.log('Extracted pages:', extractedPages)
          setPages(extractedPages)
        } else {
          // 要約がない場合は空のページ配列を設定
          console.log('No summary found, setting empty pages')
          setPages([])
        }
      } else if (chatHistory) {
        // チャット履歴から情報を抽出
        setIsLoading(true)
        try {
          const history = JSON.parse(chatHistory)
          const siteType = new URLSearchParams(window.location.search).get('type') || 'HP'
          const industry = new URLSearchParams(window.location.search).get('industry') || ''
          
          const response = await fetch('/api/extract-info', {
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
          
          if (response.ok) {
            const { siteInfo: extractedInfo } = await response.json()
            setSiteInfo(extractedInfo)
            localStorage.setItem('siteInfo', JSON.stringify(extractedInfo))
            const pages = generateSiteContent(extractedInfo)
            setPages(pages)
          }
        } catch (error) {
          console.error('Failed to extract info:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    loadAndProcessData()
  }, [])

  const handleSiteInfoUpdate = (updatedInfo: SiteInfo) => {
    setSiteInfo(updatedInfo)
    localStorage.setItem('siteInfo', JSON.stringify(updatedInfo))
    const generatedPages = generateSiteContent(updatedInfo)
    setPages(generatedPages)
  }

  const handleSectionUpdate = (pageId: string, sectionId: string, newContent: string) => {
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === pageId 
          ? {
              ...page,
              sections: page.sections.map(section =>
                section.id === sectionId
                  ? { ...section, content: newContent }
                  : section
              )
            }
          : page
      )
    )
  }

  const handleSend = async () => {
    setIsSending(true)
    
    const dataToSend = {
      siteInfo,
      pages,
      timestamp: new Date().toISOString()
    }
    
    const textContent = generateTextContent(dataToSend)
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'h_ueda@nolan.co.jp',
          content: textContent
        })
      })
      
      if (response.ok) {
        alert('送信が完了しました！')
      } else {
        alert('送信に失敗しました。もう一度お試しください。')
      }
    } catch (error) {
      console.error('Send error:', error)
      alert('送信中にエラーが発生しました。')
    } finally {
      setIsSending(false)
    }
  }

  const generateTextContent = (data: any): string => {
    let content = '=== サイト作成フォーム送信内容 ===\n\n'
    content += `作成日時: ${data.timestamp}\n\n`
    
    content += '【基本情報】\n'
    content += `サイトタイプ: ${data.siteInfo?.type}\n`
    content += `業種: ${data.siteInfo?.industry}\n`
    content += `名称: ${data.siteInfo?.basicInfo?.name || '未設定'}\n`
    content += `住所: ${data.siteInfo?.basicInfo?.address || '未設定'}\n`
    content += `電話番号: ${data.siteInfo?.basicInfo?.phone || '未設定'}\n`
    content += `営業時間: ${data.siteInfo?.basicInfo?.businessHours || '未設定'}\n`
    content += `定休日: ${data.siteInfo?.basicInfo?.holidays || '未設定'}\n`
    content += `コンセプト: ${data.siteInfo?.basicInfo?.concept || '未設定'}\n`
    content += `SNS: ${data.siteInfo?.basicInfo?.sns || '未設定'}\n\n`
    
    content += '【ページ構成】\n'
    data.pages?.forEach((page: PageInfo) => {
      content += `\n--- ${page.title} (完成度: ${page.completionRate}%) ---\n`
      page.sections.forEach(section => {
        content += `\n[${section.title}]\n${section.content}\n`
      })
    })
    
    return content
  }

  const overallCompletion = calculateOverallCompletion(pages)
  const currentPage = pages.find(p => p.id === currentPageId)

  if (!siteInfo || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">情報を整理しています...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {siteInfo.basicInfo?.name || siteInfo.industry}のサイト作成
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                AIによって要約された内容から構成を作成しました
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                全体の入力完了率: <span className="font-bold">{overallCompletion}%</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <Sidebar
          pages={pages}
          currentPageId={currentPageId}
          onPageSelect={setCurrentPageId}
          onChatHistoryClick={() => setCurrentPageId('chat-history')}
          onAISummaryClick={() => setCurrentPageId('ai-summary')}
        />
        
        <main className="flex-1 overflow-y-auto">
          {currentPageId === 'basic-info' && (
            <BasicInfoEditor
              siteInfo={siteInfo}
              onUpdate={handleSiteInfoUpdate}
            />
          )}
          
          {currentPage && (
            <PageEditor
              page={currentPage}
              onSectionUpdate={handleSectionUpdate}
            />
          )}
          
          {currentPageId === 'chat-history' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">チャット履歴</h2>
              <div className="bg-white rounded-lg shadow p-6">
                <ChatHistory />
              </div>
            </div>
          )}
          
          {currentPageId === 'ai-summary' && (
            <AISummaryView />
          )}
        </main>
      </div>

      <button
        onClick={handleSend}
        disabled={isSending}
        className="fixed bottom-8 right-8 bg-blue-600 text-white px-8 py-4 rounded-full shadow-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
      >
        {isSending ? '送信中...' : '送信'}
      </button>
      
    </div>
  )
}