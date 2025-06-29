export type SiteType = 'HP' | 'LP' | 'PORTFOLIO' | 'WEBSYSTEM'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface SiteInfo {
  type: SiteType
  industry: string
  basicInfo?: {
    name?: string
    address?: string
    phone?: string
    businessHours?: string
    holidays?: string
    concept?: string
    menu?: string
    photos?: boolean
    reservation?: boolean
    sns?: string
    specialFeatures?: string
  }
  pages?: PageInfo[]
}

export interface PageInfo {
  id: string
  title: string
  description?: string
  sections: Section[]
  completionRate: number
}

export interface Section {
  id: string
  type?: 'header' | 'hero' | 'about' | 'services' | 'contact' | 'custom'
  title: string
  content: string
  isEditable?: boolean
}