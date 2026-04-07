'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function getUploadUrl(fileName: string, contentType: string) {
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

  const filePath = `${brand.id}/${Date.now()}-${fileName}`

  const { data, error } = await supabaseAdmin.storage
    .from('drops')
    .createSignedUploadUrl(filePath)

  if (error) return { error: error.message }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/drops/${filePath}`

  return { signedUrl: data.signedUrl, token: data.token, publicUrl, filePath }
}

export async function createDrop(formData: FormData) {
  const name = formData.get('name') as string
  const mediaUrl = formData.get('mediaUrl') as string
  const mediaType = formData.get('mediaType') as string

  if (!name || !mediaUrl || !mediaType) {
    return { error: 'Missing required fields' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: brand } = await supabaseAdmin
    .from('brands')
    .select('id, max_drops')
    .eq('user_id', user.id)
    .single()

  if (!brand) return { error: 'Brand not found' }

  // Check drop limit
  const { count } = await supabaseAdmin
    .from('drops')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', brand.id)

  if ((count ?? 0) >= brand.max_drops) {
    return { error: `You've reached your limit of ${brand.max_drops} drops.` }
  }

  const { error } = await supabaseAdmin.from('drops').insert({
    brand_id: brand.id,
    name: name.trim(),
    media_url: mediaUrl,
    media_type: mediaType,
    sort_order: (count ?? 0) + 1,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/drops')
  return { success: true }
}

export async function deleteDrop(dropId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get the drop to find its file path
  const { data: drop } = await supabaseAdmin
    .from('drops')
    .select('media_url, brand_id')
    .eq('id', dropId)
    .single()

  if (!drop) return { error: 'Drop not found' }

  // Verify ownership
  const { data: brand } = await supabaseAdmin
    .from('brands')
    .select('id')
    .eq('user_id', user.id)
    .eq('id', drop.brand_id)
    .single()

  if (!brand) return { error: 'Unauthorized' }

  // Extract file path from URL and delete from storage
  const urlParts = drop.media_url.split('/drops/')
  if (urlParts.length > 1) {
    await supabaseAdmin.storage.from('drops').remove([urlParts[1]])
  }

  // Delete from DB
  const { error } = await supabaseAdmin.from('drops').delete().eq('id', dropId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/drops')
  return { success: true }
}

export async function renameDrop(dropId: string, newName: string) {
  if (!newName.trim()) return { error: 'Name cannot be empty' }

  const { error } = await supabaseAdmin
    .from('drops')
    .update({ name: newName.trim() })
    .eq('id', dropId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/drops')
  return { success: true }
}

export async function reorderDrops(orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await supabaseAdmin
      .from('drops')
      .update({ sort_order: i })
      .eq('id', orderedIds[i])
  }

  revalidatePath('/dashboard/drops')
  return { success: true }
}

export async function getHeroUploadUrl(fileName: string) {
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

  const filePath = `${brand.id}/hero-${Date.now()}-${fileName}`

  const { data, error } = await supabaseAdmin.storage
    .from('drops')
    .createSignedUploadUrl(filePath)

  if (error) return { error: error.message }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/drops/${filePath}`

  return { signedUrl: data.signedUrl, token: data.token, publicUrl }
}

export async function setHeroVideo(videoUrl: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabaseAdmin
    .from('brands')
    .update({ hero_video_url: videoUrl })
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/drops')
  return { success: true }
}

export async function removeHeroVideo() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: brand } = await supabaseAdmin
    .from('brands')
    .select('hero_video_url')
    .eq('user_id', user.id)
    .single()

  if (brand?.hero_video_url) {
    const urlParts = brand.hero_video_url.split('/drops/')
    if (urlParts.length > 1) {
      await supabaseAdmin.storage.from('drops').remove([urlParts[1]])
    }
  }

  const { error } = await supabaseAdmin
    .from('brands')
    .update({ hero_video_url: null })
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/drops')
  return { success: true }
}
