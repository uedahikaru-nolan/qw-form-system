'use client'

import { useState, useEffect } from 'react'
import { Send, Sparkles } from 'lucide-react'

interface EditableSummaryProps {
  summary: string
  onUpdate: (updatedSummary: string) => void
  disabled?: boolean
}

interface SummarySection {
  title: string
  content: string[]
  isEditing: boolean
}

export default function EditableSummary({ summary, onUpdate, disabled = false }: EditableSummaryProps) {
  const [sections, setSections] = useState<SummarySection[]>([])
  const [editingContent, setEditingContent] = useState<{[key: number]: string}>({})
  const [aiRequest, setAiRequest] = useState<{[key: number]: string}>({})
  const [isProcessing, setIsProcessing] = useState<{[key: number]: boolean}>({})

  useEffect(() => {
    // 要約を解析してセクションに分割
    const parseSummary = (text: string): SummarySection[] => {
      const sectionPattern = /###?\s+(.+)\n([\s\S]*?)(?=\n###?\s+|\n##\s+|$)/g
      const mainSectionPattern = /##\s+(.+)\n([\s\S]*?)(?=\n##\s+|$)/g
      
      const sections: SummarySection[] = []
      const mainSections = text.matchAll(mainSectionPattern)
      
      for (const mainSection of mainSections) {
        const mainTitle = mainSection[1]
        const mainContent = mainSection[2]
        
        // サブセクションを探す
        const subSections = mainContent.matchAll(sectionPattern)
        const subSectionArray = Array.from(subSections)
        
        if (subSectionArray.length > 0) {
          // サブセクションがある場合
          for (const subSection of subSectionArray) {
            const title = subSection[1]
            const content = subSection[2]
              .split('\n')
              .map(line => line.trim())
              .filter(line => line !== '')
            
            sections.push({
              title: `${mainTitle} - ${title}`,
              content,
              isEditing: true
            })
          }
        } else {
          // サブセクションがない場合
          const content = mainContent
            .split('\n')
            .map(line => line.trim())
            .filter(line => line !== '')
          
          if (content.length > 0) {
            sections.push({
              title: mainTitle,
              content,
              isEditing: true
            })
          }
        }
      }
      
      return sections
    }
    
    const parsed = parseSummary(summary)
    setSections(parsed)
    // 初期編集内容を設定
    const initialContent: {[key: number]: string} = {}
    parsed.forEach((section, index) => {
      initialContent[index] = section.content.join('\n')
    })
    setEditingContent(initialContent)
  }, [summary])

  const handleContentChange = (index: number, value: string) => {
    setEditingContent(prev => ({
      ...prev,
      [index]: value
    }))
    
    // リアルタイムで更新
    const newSections = [...sections]
    newSections[index] = {
      ...newSections[index],
      content: value.split('\n').filter(line => line.trim() !== '')
    }
    const newSummary = reconstructSummary(newSections)
    onUpdate(newSummary)
  }

  const handleAiEdit = async (index: number) => {
    const request = aiRequest[index]
    if (!request || !request.trim()) return
    
    setIsProcessing(prev => ({ ...prev, [index]: true }))
    
    try {
      const response = await fetch('/api/edit-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionTitle: sections[index].title,
          currentContent: editingContent[index] || sections[index].content.join('\n'),
          editRequest: request
        })
      })
      
      if (response.ok) {
        const { editedContent } = await response.json()
        handleContentChange(index, editedContent)
        setAiRequest(prev => ({ ...prev, [index]: '' }))
      } else {
        alert('AI編集に失敗しました。もう一度お試しください。')
      }
    } catch (error) {
      console.error('AI edit error:', error)
      alert('エラーが発生しました。')
    } finally {
      setIsProcessing(prev => ({ ...prev, [index]: false }))
    }
  }

  const reconstructSummary = (sections: SummarySection[]): string => {
    let result = ''
    let currentMainSection = ''
    
    sections.forEach((section) => {
      if (section.title.includes(' - ')) {
        const [main, sub] = section.title.split(' - ')
        if (main !== currentMainSection) {
          result += `\n## ${main}\n\n`
          currentMainSection = main
        }
        result += `### ${sub}\n`
      } else {
        result += `\n## ${section.title}\n\n`
      }
      
      section.content.forEach(line => {
        result += `${line}\n`
      })
    })
    
    return result.trim()
  }

  // プレビュー用のレンダリング関数
  const renderPreview = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim() !== '')
    
    return lines.map((line, lineIndex) => {
      // 太字テキストの処理
      const renderLine = (text: string) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g)
        return parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const innerText = part.slice(2, -2)
            return <strong key={i} className="font-bold text-gray-900">{innerText}</strong>
          }
          return <span key={i}>{part}</span>
        })
      }
      
      // インデントレベルを計算
      const indentMatch = line.match(/^(\s*)-\s*/)
      const indentLevel = indentMatch ? Math.floor(indentMatch[1].length / 2) : -1
      
      if (indentLevel >= 0) {
        const content = line.replace(/^\s*-\s*/, '')
        const isMainItem = content.match(/^\*\*[^*]+\*\*/)
        
        return (
          <div
            key={lineIndex}
            className={`flex items-start ${
              indentLevel === 0 && isMainItem ? 'mb-3 mt-4' : 
              indentLevel === 0 ? 'mb-2' :
              'mb-1'
            }`}
            style={{
              marginLeft: indentLevel > 0 ? `${indentLevel * 1.5}rem` : undefined,
            }}
          >
            <span className={`mr-2 flex-shrink-0 ${
              indentLevel === 0 && isMainItem ? 'text-blue-600 text-lg' : 
              indentLevel === 0 ? 'text-gray-600' :
              indentLevel === 1 ? 'text-gray-400' :
              'text-gray-300 text-sm'
            }`}>
              {indentLevel === 0 && isMainItem ? '▶' : indentLevel === 0 ? '•' : indentLevel === 1 ? '◦' : '▪'}
            </span>
            <span className={`${
              isMainItem && indentLevel === 0 ? 'text-base font-semibold' : 
              indentLevel === 0 ? 'text-gray-800' :
              'text-gray-700 text-sm'
            } leading-relaxed`}>
              {renderLine(content)}
            </span>
          </div>
        )
      } else {
        return (
          <p key={lineIndex} className="text-gray-700 mb-2">
            {renderLine(line)}
          </p>
        )
      }
    })
  }

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <div key={index} className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b">
              {section.title.replace(' - ', ' › ')}
            </h3>
            
            {!disabled ? (
              <div className="grid grid-cols-2 gap-6">
                {/* 左側: プレビュー */}
                <div className="bg-gray-50 p-4 rounded-lg h-fit">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">プレビュー</h4>
                  <div className="mt-3">
                    {renderPreview(editingContent[index] || '')}
                  </div>
                </div>
                
                {/* 右側: 編集エリア */}
                <div className="space-y-3">
                  <div className="text-xs text-gray-500">
                    ※ 各行で改行してください。「- 」で始まる行は箇条書きとして表示されます。
                  </div>
                  <textarea
                    className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    rows={Math.max(12, editingContent[index]?.split('\n').length + 2 || 12)}
                    value={editingContent[index] || ''}
                    onChange={(e) => handleContentChange(index, e.target.value)}
                    placeholder="例：\n- **ホーム** - 第一印象を決める重要なページ\n  - ヒーローセクション\n    - キャッチコピー: 「心を込めた料理でおもてなし」\n\n- **飲食店について** - 信頼性を高めるページ\n  - 店舗の理念\n  - シェフの紹介"
                    style={{ lineHeight: '1.8' }}
                  />
                  <div className="text-xs text-gray-500">
                    <span className="font-semibold">**太字**</span>でテキストを強調できます
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                {renderPreview(section.content.join('\n'))}
              </div>
            )}
          </div>
          
          {/* AI編集リクエストセクション */}
          {!disabled && (
            <div className="border-t bg-purple-50/50 p-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                AIに編集をお願いする
              </h4>
              <div className="flex gap-3">
                <textarea
                  value={aiRequest[index] || ''}
                  onChange={(e) => setAiRequest(prev => ({ ...prev, [index]: e.target.value }))}
                  placeholder="例: ビジョンとミッションも追加してください"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={2}
                  disabled={isProcessing[index]}
                />
                <button
                  onClick={() => handleAiEdit(index)}
                  disabled={!aiRequest[index]?.trim() || isProcessing[index]}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
                >
                  {isProcessing[index] ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>処理中...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>送信</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}