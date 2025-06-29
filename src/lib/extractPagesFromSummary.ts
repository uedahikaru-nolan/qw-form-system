import { PageInfo } from '@/types'

export function extractPagesFromSummary(summary: string): PageInfo[] {
  const pages: PageInfo[] = []
  
  console.log('Extracting pages from summary, length:', summary.length)
  
  // シンプルなアプローチ：要約全体からページを抽出
  const lines = summary.split('\n')
  let inPageSection = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // 推奨ページ構成セクションの開始を検出
    if (line.includes('推奨ページ構成')) {
      inPageSection = true
      console.log('Found page section start')
      continue
    }
    
    // 次のメインセクションに到達したら終了
    if (inPageSection && line.startsWith('###') && (line.includes('デザイン') || line.includes('SEO'))) {
      console.log('Reached end of page section')
      break
    }
    
    // ページ項目を抽出（- **ページ名** の形式）
    if (inPageSection && line.trim().startsWith('-') && line.includes('**')) {
      const match = line.match(/^-\s*\*\*(.+?)\*\*/)
      if (match) {
        const title = match[1].trim()
        console.log('Found page:', title)
        
        // 説明を探す（同じ行の後ろ部分）
        let description = ''
        const afterTitle = line.substring(line.indexOf('**', line.indexOf('**') + 2) + 2).trim()
        if (afterTitle && afterTitle.startsWith('-')) {
          description = afterTitle.substring(1).trim()
        }
        
        const id = generatePageId(title)
        const sections = extractPageSections(lines, i)
        
        pages.push({
          id,
          title,
          description,
          completionRate: 0,
          sections
        })
      }
    }
  }
  
  console.log('Total pages extracted:', pages.length)
  
  return pages
}

function generatePageId(title: string): string {
  const idMap: Record<string, string> = {
    'ホーム': 'home',
    'アクセス': 'access',
    'お問い合わせ': 'contact',
    'アクセス/お問い合わせ': 'access-contact',
    'ブログ': 'blog',
    'ニュース': 'news',
    'お知らせ': 'news',
    'ニュース/お知らせ': 'news',
    'サービス': 'services',
    'メニュー': 'menu',
    'ソリューション': 'solutions',
    'ソリューション/サービス': 'services',
    'プロジェクト': 'projects',
    '作品': 'works',
    '実績': 'achievements',
    'について': 'about',
    'プロフィール': 'profile',
    '会社概要': 'company',
  }
  
  // 完全一致を試す
  if (idMap[title]) {
    return idMap[title]
  }
  
  // 部分一致を試す
  for (const [key, value] of Object.entries(idMap)) {
    if (title.includes(key)) {
      return value
    }
  }
  
  // マッチしない場合は、日本語をローマ字に変換（簡易版）
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'page'
}

function extractPageSections(lines: string[], pageIndex: number): any[] {
  const sections: any[] = []
  
  // 次のページまでのサブ項目を探す
  for (let i = pageIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 次のページに到達したら終了
    if (line.startsWith('-') && line.includes('**')) {
      break
    }
    
    // サブセクションの終了条件
    if (line.startsWith('###')) {
      break
    }
    
    // サブ項目（インデントされた - で始まる行）
    if (line.startsWith('-') && !line.includes('**')) {
      const sectionTitle = line.substring(1).trim()
      const sectionId = generateSectionId(sectionTitle)
      
      sections.push({
        id: sectionId,
        title: sectionTitle,
        content: ''
      })
    }
  }
  
  // セクションが見つからない場合のデフォルト
  if (sections.length === 0) {
    sections.push({
      id: 'main',
      title: 'メインコンテンツ',
      content: ''
    })
  }
  
  return sections
}

function generateSectionId(title: string): string {
  const idMap: Record<string, string> = {
    'ヒーローセクション': 'hero',
    'メインビジュアル': 'hero',
    'キャッチコピー': 'hero',
    '概要': 'overview',
    '特徴': 'features',
    'サービス': 'services',
    '実績': 'achievements',
    'お客様の声': 'testimonials',
    'CTA': 'cta',
    'お問い合わせ': 'contact',
    'アクセス': 'access',
    '地図': 'map',
    'フォーム': 'form',
  }
  
  // 完全一致または部分一致を探す
  for (const [key, value] of Object.entries(idMap)) {
    if (title.includes(key)) {
      return value
    }
  }
  
  // マッチしない場合は簡易的なID生成
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 20) || 'section'
}