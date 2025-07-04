'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type SiteType = 'HP' | 'LP' | 'PORTFOLIO' | 'WEBSYSTEM' | null

interface FormData {
  companyName: string
  serviceName: string
  contactPerson: string
  email: string
  phone: string
  industry: string
  conceptVMV: string
  themeColor: string
  currentSiteUrl: string
  referenceUrls: string[]
  mainContents: string
  pageCount: string
  deadline: string
  otherRequests: string
}

export default function Home() {
  const [siteType, setSiteType] = useState<SiteType>(null)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    serviceName: '',
    contactPerson: '',
    email: '',
    phone: '',
    industry: '',
    conceptVMV: '',
    themeColor: '',
    currentSiteUrl: '',
    referenceUrls: [''],
    mainContents: '',
    pageCount: '',
    deadline: '',
    otherRequests: ''
  })
  const router = useRouter()

  const handleSiteTypeSelect = (type: SiteType) => {
    setSiteType(type)
    setStep(2)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.contactPerson.trim() && formData.email.trim()) {
      // LocalStorageに保存
      localStorage.setItem('initialFormData', JSON.stringify(formData))
      router.push(`/chat?type=${siteType}&industry=${encodeURIComponent(formData.industry)}`)
    }
  }

  const updateFormData = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addReferenceUrl = () => {
    setFormData(prev => ({ ...prev, referenceUrls: [...prev.referenceUrls, ''] }))
  }

  const updateReferenceUrl = (index: number, value: string) => {
    const newUrls = [...formData.referenceUrls]
    newUrls[index] = value
    setFormData(prev => ({ ...prev, referenceUrls: newUrls }))
  }

  const removeReferenceUrl = (index: number) => {
    if (formData.referenceUrls.length > 1) {
      const newUrls = formData.referenceUrls.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, referenceUrls: newUrls }))
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Webサイト作成フォーム
        </h1>

        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-6 text-gray-700">
              何を作りたいですか？
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSiteTypeSelect('HP')}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="text-lg font-semibold">HP</div>
                <div className="text-sm text-gray-600 mt-2">ホームページ</div>
              </button>
              <button
                onClick={() => handleSiteTypeSelect('LP')}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="text-lg font-semibold">LP</div>
                <div className="text-sm text-gray-600 mt-2">ランディングページ</div>
              </button>
              <button
                onClick={() => handleSiteTypeSelect('PORTFOLIO')}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="text-lg font-semibold">ポートフォリオサイト</div>
                <div className="text-sm text-gray-600 mt-2">作品集サイト</div>
              </button>
              <button
                onClick={() => handleSiteTypeSelect('WEBSYSTEM')}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="text-lg font-semibold">Webシステム</div>
                <div className="text-sm text-gray-600 mt-2">業務システム</div>
              </button>
            </div>
          </div>
        )}

        {step === 2 && siteType === 'HP' && (
          <div className="max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setStep(1)}
              className="mb-4 text-blue-600 hover:text-blue-800 flex items-center sticky top-0 bg-white"
            >
              ← 戻る
            </button>
            <h2 className="text-xl font-semibold mb-6 text-gray-700">
              ホームページ作成に必要な情報を教えてください
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* 会社名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  会社名（屋号）<span className="text-gray-500 text-xs ml-1">（あれば）</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* サービス名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  サービス名<span className="text-gray-500 text-xs ml-1">（あれば）</span>
                </label>
                <input
                  type="text"
                  value={formData.serviceName}
                  onChange={(e) => updateFormData('serviceName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 担当者名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ご担当者様のお名前<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => updateFormData('contactPerson', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 電話番号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号<span className="text-gray-500 text-xs ml-1">（任意）</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="例：03-1234-5678"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 業種 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  業種
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => updateFormData('industry', e.target.value)}
                  placeholder="例：飲食店、美容院、IT企業など"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* コンセプト・VMV */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  コンセプトやVMV<span className="text-gray-500 text-xs ml-1">（あれば）</span>
                </label>
                <textarea
                  value={formData.conceptVMV}
                  onChange={(e) => updateFormData('conceptVMV', e.target.value)}
                  placeholder="例：Vision（ビジョン）、Mission（ミッション）、Value（バリュー）やサイトのコンセプトなど"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* イメージカラー */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  サイトのイメージカラー
                </label>
                <input
                  type="text"
                  value={formData.themeColor}
                  onChange={(e) => updateFormData('themeColor', e.target.value)}
                  placeholder="例：青系、緑系、モノトーンなど"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 現在のサイトURL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  現在のサイトURL<span className="text-gray-500 text-xs ml-1">（あれば）</span>
                </label>
                <input
                  type="url"
                  value={formData.currentSiteUrl}
                  onChange={(e) => updateFormData('currentSiteUrl', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 参考サイトURL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  参考にしたいサイトURL<span className="text-gray-500 text-xs ml-1">（任意・複数可）</span>
                </label>
                {formData.referenceUrls.map((url, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updateReferenceUrl(index, e.target.value)}
                      placeholder="https://example.com"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {formData.referenceUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeReferenceUrl(index)}
                        className="px-3 py-3 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        削除
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addReferenceUrl}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + URLを追加
                </button>
              </div>

              {/* サイトに載せたい内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  サイトに載せたい主な内容
                </label>
                <textarea
                  value={formData.mainContents}
                  onChange={(e) => updateFormData('mainContents', e.target.value)}
                  placeholder="例：サービス紹介、料金表、会社情報など"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* ページ数 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ご希望のページ数<span className="text-gray-500 text-xs ml-1">（おおよそで可）</span>
                </label>
                <input
                  type="text"
                  value={formData.pageCount}
                  onChange={(e) => updateFormData('pageCount', e.target.value)}
                  placeholder="例：5ページ程度"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 納期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  納期の希望時期
                </label>
                <input
                  type="text"
                  value={formData.deadline}
                  onChange={(e) => updateFormData('deadline', e.target.value)}
                  placeholder="例：3ヶ月以内、〇月までに"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* その他要望 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  その他ご要望
                </label>
                <textarea
                  value={formData.otherRequests}
                  onChange={(e) => updateFormData('otherRequests', e.target.value)}
                  placeholder="その他、ご要望があればお書きください"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="mt-6 w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                AIと相談を開始する
              </button>
            </form>
          </div>
        )}

        {/* 他のサイトタイプの場合は従来の業種入力フォーム */}
        {step === 2 && siteType !== 'HP' && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← 戻る
            </button>
            <h2 className="text-xl font-semibold mb-6 text-gray-700">
              業種を教えてください
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              if (formData.industry.trim()) {
                router.push(`/chat?type=${siteType}&industry=${encodeURIComponent(formData.industry)}`)
              }
            }}>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => updateFormData('industry', e.target.value)}
                placeholder="例：飲食店、美容院、IT企業など"
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="mt-6 w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                次へ進む
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}