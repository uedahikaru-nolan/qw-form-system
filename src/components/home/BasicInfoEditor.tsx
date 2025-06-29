import { useState } from 'react'
import { SiteInfo } from '@/types'

interface BasicInfoEditorProps {
  siteInfo: SiteInfo
  onUpdate: (updatedInfo: SiteInfo) => void
}

export default function BasicInfoEditor({ siteInfo, onUpdate }: BasicInfoEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: siteInfo.basicInfo?.name || '',
    industry: siteInfo.industry,
    address: siteInfo.basicInfo?.address || '',
    phone: siteInfo.basicInfo?.phone || '',
    businessHours: siteInfo.basicInfo?.businessHours || '',
    holidays: siteInfo.basicInfo?.holidays || '',
    concept: siteInfo.basicInfo?.concept || '',
    sns: typeof siteInfo.basicInfo?.sns === 'object' 
      ? JSON.stringify(siteInfo.basicInfo.sns) 
      : siteInfo.basicInfo?.sns || ''
  })

  const handleSave = () => {
    // SNSデータを適切な形式に変換
    let snsData = formData.sns
    try {
      // JSON形式の場合はパースして保存
      const parsed = JSON.parse(formData.sns)
      if (typeof parsed === 'object') {
        snsData = parsed
      }
    } catch {
      // パースできない場合は文字列のまま
    }
    
    const updatedInfo: SiteInfo = {
      ...siteInfo,
      industry: formData.industry,
      basicInfo: {
        ...siteInfo.basicInfo,
        ...formData,
        sns: snsData
      }
    }
    onUpdate(updatedInfo)
    setIsEditing(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">基本情報</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800"
          >
            編集
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">業種</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">住所</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">電話番号</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">営業時間</label>
              <input
                type="text"
                value={formData.businessHours}
                onChange={(e) => handleChange('businessHours', e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">定休日</label>
              <input
                type="text"
                value={formData.holidays}
                onChange={(e) => handleChange('holidays', e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">コンセプト</label>
              <textarea
                value={formData.concept}
                onChange={(e) => handleChange('concept', e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">SNS</label>
              <textarea
                value={formData.sns}
                onChange={(e) => handleChange('sns', e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                placeholder='例: {"facebook": "https://facebook.com/yourpage", "instagram": "@youraccount"}'
                rows={2}
              />
              <p className="text-xs text-gray-500 mt-1">
                JSON形式または自由テキストで入力できます
              </p>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                保存
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <span className="font-medium">名称:</span> {formData.name || '未設定'}
            </div>
            <div>
              <span className="font-medium">業種:</span> {formData.industry}
            </div>
            <div>
              <span className="font-medium">住所:</span> {formData.address || '未設定'}
            </div>
            <div>
              <span className="font-medium">電話番号:</span> {formData.phone || '未設定'}
            </div>
            <div>
              <span className="font-medium">営業時間:</span> {formData.businessHours || '未設定'}
            </div>
            <div>
              <span className="font-medium">定休日:</span> {formData.holidays || '未設定'}
            </div>
            <div>
              <span className="font-medium">コンセプト:</span> {formData.concept || '未設定'}
            </div>
            <div>
              <span className="font-medium">SNS:</span> {
                (() => {
                  if (!formData.sns) return '未設定'
                  try {
                    const snsData = JSON.parse(formData.sns)
                    if (typeof snsData === 'object') {
                      return Object.entries(snsData)
                        .filter(([_, value]) => value)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ') || '未設定'
                    }
                  } catch {
                    // JSON.parseでエラーが出た場合は文字列として扱う
                  }
                  return formData.sns
                })()
              }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}