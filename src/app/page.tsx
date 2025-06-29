'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type SiteType = 'HP' | 'LP' | 'PORTFOLIO' | 'WEBSYSTEM' | null

export default function Home() {
  const [siteType, setSiteType] = useState<SiteType>(null)
  const [industry, setIndustry] = useState('')
  const [step, setStep] = useState(1)
  const router = useRouter()

  const handleSiteTypeSelect = (type: SiteType) => {
    setSiteType(type)
    setStep(2)
  }

  const handleIndustrySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (industry.trim()) {
      router.push(`/chat?type=${siteType}&industry=${encodeURIComponent(industry)}`)
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

        {step === 2 && (
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
            <form onSubmit={handleIndustrySubmit}>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
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