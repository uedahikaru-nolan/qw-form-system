import { useEffect, useState } from 'react'
import { ChatMessage } from '@/types'

export default function ChatHistory() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory')
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setChatHistory(parsed)
      } catch (error) {
        console.error('Failed to parse chat history:', error)
      }
    }
  }, [])

  if (chatHistory.length === 0) {
    return (
      <p className="text-gray-500">チャット履歴がありません</p>
    )
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {chatHistory.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-md p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-100 text-blue-900'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            <p className="text-xs font-medium mb-1">
              {message.role === 'user' ? 'あなた' : 'AI'}
            </p>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}