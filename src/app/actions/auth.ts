'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateSlug } from '@/lib/utils'

export type AuthState = {
  error?: string
}

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const brandName = formData.get('brandName') as string
  const inviteCode = formData.get('inviteCode') as string

  if (!email || !password || !brandName || !inviteCode) {
    return { error: 'All fields are required.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  // Validate invite code
  const { data: codeData, error: codeError } = await supabaseAdmin
    .from('brand_invite_codes')
    .select('id')
    .eq('code', inviteCode.trim().toUpperCase())
    .eq('used', false)
    .single()

  if (codeError || !codeData) {
    return { error: 'Invalid or already used invite code.' }
  }

  // Generate and check slug
  const slug = generateSlug(brandName)
  if (!slug) {
    return { error: 'Brand name is invalid.' }
  }

  const { data: existingSlug } = await supabaseAdmin
    .from('brands')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existingSlug) {
    return { error: 'That brand name is already taken. Please pick a different name.' }
  }

  // Create auth user
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    return { error: authError?.message || 'Failed to create account.' }
  }

  // Insert brand row
  const { error: brandError } = await supabaseAdmin
    .from('brands')
    .insert({
      user_id: authData.user.id,
      name: brandName.trim(),
      slug,
      email,
    })

  if (brandError) {
    return { error: 'Failed to create brand profile.' }
  }

  // Mark invite code as used
  await supabaseAdmin
    .from('brand_invite_codes')
    .update({ used: true, used_by: authData.user.id })
    .eq('id', codeData.id)

  // Sign in immediately
  await supabase.auth.signInWithPassword({ email, password })

  redirect('/dashboard')
}

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Invalid email or password.' }
  }

  // Check if owner
  const { data: brand } = await supabaseAdmin
    .from('brands')
    .select('is_owner')
    .eq('email', email)
    .single()

  if (brand?.is_owner) {
    redirect('/owner')
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
