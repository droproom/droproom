'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import crypto from 'crypto'

async function verifyOwner() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: brand } = await supabaseAdmin
    .from('brands')
    .select('id, is_owner')
    .eq('user_id', user.id)
    .single()

  if (!brand?.is_owner) return null
  return brand
}

function generateSecureCode(): string {
  // Generates something like "DR-7F3A9X-K2M8BW"
  const bytes = crypto.randomBytes(8)
  const hex = bytes.toString('hex').toUpperCase()
  return `DR-${hex.slice(0, 6)}-${hex.slice(6, 12)}`
}

export async function generateInviteCode() {
  const owner = await verifyOwner()
  if (!owner) return { error: 'Unauthorized' }

  const code = generateSecureCode()

  const { error } = await supabaseAdmin.from('brand_invite_codes').insert({
    code,
  })

  if (error) return { error: error.message }

  revalidatePath('/owner')
  return { success: true, code }
}

export async function suspendBrand(brandId: string) {
  const owner = await verifyOwner()
  if (!owner) return { error: 'Unauthorized' }

  const { error } = await supabaseAdmin
    .from('brands')
    .update({ subscription_status: 'suspended' })
    .eq('id', brandId)

  if (error) return { error: error.message }

  revalidatePath('/owner')
  return { success: true }
}

export async function reactivateBrand(brandId: string) {
  const owner = await verifyOwner()
  if (!owner) return { error: 'Unauthorized' }

  const { error } = await supabaseAdmin
    .from('brands')
    .update({ subscription_status: 'active' })
    .eq('id', brandId)

  if (error) return { error: error.message }

  revalidatePath('/owner')
  return { success: true }
}
