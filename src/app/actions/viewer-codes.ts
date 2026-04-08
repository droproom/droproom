'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateCode, getExpirationDate } from '@/lib/utils'

export async function generateViewerCode(formData: FormData) {
  const duration = formData.get('duration') as '24h' | '48h' | '7d' | '30d' | 'forever'

  if (!duration || !['24h', '48h', '7d', '30d', 'forever'].includes(duration)) {
    return { error: 'Invalid duration' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: brand } = await supabaseAdmin
    .from('brands')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!brand) return { error: 'Brand not found' }

  const code = generateCode(8)
  const expiresAt = getExpirationDate(duration)

  const { error } = await supabaseAdmin.from('viewer_codes').insert({
    brand_id: brand.id,
    code,
    expires_at: expiresAt ? expiresAt.toISOString() : null,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/codes')
  return { success: true, code }
}

export async function revokeViewerCode(codeId: string) {
  const { error } = await supabaseAdmin
    .from('viewer_codes')
    .update({ revoked: true })
    .eq('id', codeId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/codes')
  return { success: true }
}
