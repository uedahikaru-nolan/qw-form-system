import { PageInfo } from '@/types'

interface SidebarProps {
  pages: PageInfo[]
  currentPageId: string
  onPageSelect: (pageId: string) => void
  onChatHistoryClick: () => void
  onAISummaryClick: () => void
}

export default function Sidebar({ pages, currentPageId, onPageSelect, onChatHistoryClick, onAISummaryClick }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2">サイト構成</h2>
        <p className="text-xs text-gray-400 mb-6">AIが判断したページ構成</p>
        
        <nav className="space-y-1">
          {/* ホーム */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">メイン</h3>
            <button
              onClick={() => onPageSelect('basic-info')}
              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-2 ${
                currentPageId === 'basic-info' ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              基本情報
            </button>
          </div>
          
          {/* ページ構成 */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">ページ構成</h3>
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => onPageSelect(page.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-2 ${
                  currentPageId === page.id ? 'bg-gray-700' : 'hover:bg-gray-800'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{page.title}</span>
                    <span className="text-xs text-gray-400">{page.completionRate}%</span>
                  </div>
                  {page.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{page.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {/* AIからの提案 */}
          <div className="border-t border-gray-700 pt-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AIからの提案</h3>
            <button
              onClick={onAISummaryClick}
              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-2 ${
                currentPageId === 'ai-summary' ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              提案内容
            </button>
          </div>
          
          {/* 履歴 */}
          <div className="border-t border-gray-700 pt-4">
            <button
              onClick={onChatHistoryClick}
              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-2 ${
                currentPageId === 'chat-history' ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              チャット履歴
            </button>
          </div>
        </nav>
      </div>
    </aside>
  )
}