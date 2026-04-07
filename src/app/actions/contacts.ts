'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function addContact(formData: FormData) {
  const label = formData.get('label') as string
  const url = formData.get('url') as string

  if (!label || !url) {
    return { error: 'Label and URL are required.' }
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

  // Enforce max 3 contacts
  const { count } = await supabaseAdmin
    .from('brand_contacts')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', brand.id)

  if ((count ?? 0) >= 3) {
    return { error: 'Maximum 3 contact methods allowed.' }
  }

  const { error } = await supabaseAdmin.from('brand_contacts').insert({
    brand_id: brand.id,
    label: label.trim(),
    url: url.trim(),
    sort_order: (count ?? 0) + 1,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/contacts')
  return { success: true }
}

export async function deleteContact(contactId: string) {
  const { error } = await supabaseAdmin
    .from('brand_contacts')
    .delete()
    .eq('id', contactId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/contacts')
  return { success: true }
}
