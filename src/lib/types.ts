export type Brand = {
  id: string
  user_id: string
  name: string
  slug: string
  email: string
  subscription_status: 'active' | 'suspended'
  max_drops: number
  is_owner: boolean
  hero_video_url: string | null
  tagline: string | null
  created_at: string
}

export type Drop = {
  id: string
  brand_id: string
  name: string
  media_url: string
  media_type: 'image' | 'video'
  sort_order: number
  created_at: string
}

export type BrandInviteCode = {
  id: string
  code: string
  used: boolean
  used_by: string | null
  created_at: string
}

export type ViewerCode = {
  id: string
  brand_id: string
  code: string
  expires_at: string | null
  revoked: boolean
  created_at: string
}

export type ViewerCodeUse = {
  id: string
  viewer_code_id: string
  used_at: string
  ip_address: string | null
  user_agent: string | null
}

export type BrandContact = {
  id: string
  brand_id: string
  label: string
  url: string
  sort_order: number
}
