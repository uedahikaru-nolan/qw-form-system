import { SiteInfo, PageInfo, Section } from '@/types'

export function generateSiteContent(siteInfo: SiteInfo): PageInfo[] {
  const { type, industry, basicInfo } = siteInfo

  if (type === 'HP') {
    return generateHPContent(industry, basicInfo)
  } else if (type === 'LP') {
    return generateLPContent(industry, basicInfo)
  } else if (type === 'PORTFOLIO') {
    return generatePortfolioContent(industry, basicInfo)
  } else {
    return generateWebSystemContent(industry, basicInfo)
  }
}

function generateHPContent(industry: string, basicInfo: any): PageInfo[] {
  const hasBasicInfo = basicInfo && Object.keys(basicInfo).some(key => basicInfo[key] && basicInfo[key] !== null)
  
  return [
    {
      id: 'home',
      title: 'ホーム',
      completionRate: hasBasicInfo ? 85 : 30,
      sections: [
        {
          id: 'header',
          type: 'header',
          title: 'ヘッダー',
          content: `${basicInfo?.name || `${industry}のホームページ`}`,
          isEditable: true
        },
        {
          id: 'hero',
          type: 'hero',
          title: 'ヒーローセクション',
          content: generateHeroContent(basicInfo, industry),
          isEditable: true
        },
        {
          id: 'about',
          type: 'about',
          title: '私たちについて',
          content: generateAboutContent(basicInfo, industry),
          isEditable: true
        }
      ]
    },
    {
      id: 'menu',
      title: 'メニュー',
      completionRate: basicInfo?.menu ? 80 : 20,
      sections: [
        {
          id: 'menu-list',
          type: 'custom',
          title: 'メニュー一覧',
          content: generateMenuContent(basicInfo),
          isEditable: true
        }
      ]
    },
    {
      id: 'blog',
      title: 'ブログ',
      completionRate: 50,
      sections: [
        {
          id: 'blog-list',
          type: 'custom',
          title: '最新記事',
          content: 'ブログ記事はまだありません',
          isEditable: true
        }
      ]
    },
    {
      id: 'about',
      title: 'アバウト',
      completionRate: calculateAboutCompletion(basicInfo),
      sections: [
        {
          id: 'about-detail',
          type: 'about',
          title: '詳細情報',
          content: generateDetailedAboutContent(basicInfo, industry),
          isEditable: true
        }
      ]
    },
    {
      id: 'access',
      title: 'アクセス',
      completionRate: basicInfo?.address ? 90 : 30,
      sections: [
        {
          id: 'access-info',
          type: 'contact',
          title: 'アクセス情報',
          content: generateAccessContent(basicInfo),
          isEditable: true
        }
      ]
    }
  ]
}

function generateLPContent(industry: string, basicInfo: any): PageInfo[] {
  return [
    {
      id: 'landing',
      title: 'ランディングページ',
      completionRate: 60,
      sections: [
        {
          id: 'lp-hero',
          type: 'hero',
          title: 'メインビジュアル',
          content: `${industry}の革新的なソリューション`,
          isEditable: true
        },
        {
          id: 'lp-features',
          type: 'services',
          title: '特徴',
          content: '特徴1: 高品質\n特徴2: 迅速対応\n特徴3: 充実サポート',
          isEditable: true
        }
      ]
    }
  ]
}

function generatePortfolioContent(industry: string, basicInfo: any): PageInfo[] {
  return [
    {
      id: 'portfolio',
      title: 'ポートフォリオ',
      completionRate: 50,
      sections: [
        {
          id: 'portfolio-intro',
          type: 'hero',
          title: '自己紹介',
          content: `${industry}として活動しています`,
          isEditable: true
        },
        {
          id: 'works',
          type: 'custom',
          title: '作品集',
          content: '作品を追加してください',
          isEditable: true
        }
      ]
    }
  ]
}

function generateWebSystemContent(industry: string, basicInfo: any): PageInfo[] {
  return [
    {
      id: 'system',
      title: 'システム概要',
      completionRate: 40,
      sections: [
        {
          id: 'system-overview',
          type: 'about',
          title: 'システム概要',
          content: `${industry}向けWebシステム`,
          isEditable: true
        }
      ]
    }
  ]
}

function generateHeroContent(basicInfo: any, industry: string): string {
  if (!basicInfo?.name && !basicInfo?.concept) {
    return `${industry}のウェブサイトへようこそ\n\nお客様に最高のサービスを提供しています。`
  }
  
  let content = `${basicInfo.name || industry}へようこそ\n\n`
  
  if (basicInfo.concept) {
    content += basicInfo.concept
  } else if (basicInfo.specialFeatures) {
    content += basicInfo.specialFeatures
  } else {
    content += `私たちは${industry}として、お客様に最高のサービスを提供しています。`
  }
  
  return content
}

function generateAboutContent(basicInfo: any, industry: string): string {
  let content = ''
  
  if (basicInfo?.specialFeatures) {
    content = basicInfo.specialFeatures
  } else if (basicInfo?.concept) {
    content = `【コンセプト】\n${basicInfo.concept}`
  } else {
    content = `${industry}としてお客様に最高のサービスを提供しています。`
  }
  
  if (basicInfo?.businessHours || basicInfo?.holidays) {
    content += '\n\n【営業情報】'
    if (basicInfo.businessHours) content += `\n営業時間: ${basicInfo.businessHours}`
    if (basicInfo.holidays) content += `\n定休日: ${basicInfo.holidays}`
  }
  
  return content
}

function generateMenuContent(basicInfo: any): string {
  if (basicInfo?.menu) {
    return `【メニュー】\n${basicInfo.menu}`
  }
  return 'メニュー情報はまだ登録されていません。\n「編集」ボタンからメニューを追加してください。'
}

function calculateAboutCompletion(basicInfo: any): number {
  if (!basicInfo) return 20
  let score = 20
  if (basicInfo.name) score += 20
  if (basicInfo.businessHours) score += 20
  if (basicInfo.holidays) score += 10
  if (basicInfo.concept || basicInfo.specialFeatures) score += 30
  return Math.min(score, 100)
}

function generateDetailedAboutContent(basicInfo: any, industry: string): string {
  let content = ''
  
  if (basicInfo?.name) {
    content += `【${basicInfo.name}】\n\n`
  }
  
  if (basicInfo?.concept) {
    content += `${basicInfo.concept}\n\n`
  } else if (basicInfo?.specialFeatures) {
    content += `${basicInfo.specialFeatures}\n\n`
  }
  
  if (basicInfo?.businessHours || basicInfo?.holidays || basicInfo?.phone) {
    content += '【店舗情報】\n'
    if (basicInfo.businessHours) content += `営業時間: ${basicInfo.businessHours}\n`
    if (basicInfo.holidays) content += `定休日: ${basicInfo.holidays}\n`
    if (basicInfo.phone) content += `電話: ${basicInfo.phone}\n`
  }
  
  if (basicInfo?.sns) {
    content += `\n【SNS】\n${basicInfo.sns}`
  }
  
  return content || `${industry}の詳細情報をここに表示します。`
}

function generateAccessContent(basicInfo: any): string {
  let content = ''
  
  if (basicInfo?.address) {
    content += `【住所】\n${basicInfo.address}\n\n`
  }
  
  if (basicInfo?.phone) {
    content += `【電話番号】\n${basicInfo.phone}\n\n`
  }
  
  if (basicInfo?.businessHours) {
    content += `【営業時間】\n${basicInfo.businessHours}\n\n`
  }
  
  if (basicInfo?.holidays) {
    content += `【定休日】\n${basicInfo.holidays}`
  }
  
  return content || 'アクセス情報がまだ登録されていません。'
}

export function calculateOverallCompletion(pages: PageInfo[]): number {
  if (pages.length === 0) return 0
  const total = pages.reduce((sum, page) => sum + page.completionRate, 0)
  return Math.round(total / pages.length)
}