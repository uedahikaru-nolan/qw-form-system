import { useState } from 'react'
import { PageInfo, Section } from '@/types'

interface PageEditorProps {
  page: PageInfo
  onSectionUpdate: (pageId: string, sectionId: string, newContent: string) => void
}

export default function PageEditor({ page, onSectionUpdate }: PageEditorProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const handleEdit = (section: Section) => {
    setEditingSection(section.id)
    setEditContent(section.content)
  }

  const handleSave = (sectionId: string) => {
    onSectionUpdate(page.id, sectionId, editContent)
    setEditingSection(null)
  }

  const handleCancel = () => {
    setEditingSection(null)
    setEditContent('')
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{page.title}</h2>
      
      <div className="space-y-6">
        {page.sections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{section.title}</h3>
              {section.isEditable && editingSection !== section.id && (
                <button
                  onClick={() => handleEdit(section)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  編集
                </button>
              )}
            </div>
            
            {editingSection === section.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500"
                  rows={6}
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleSave(section.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-gray-700">{section.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}