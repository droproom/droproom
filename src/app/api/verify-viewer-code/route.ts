import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { code, slug } = await request.json()

  if (!code || !slug) {
    return NextResponse.json({ error: 'Code and slug are required' }, { status: 400 })
  }

  // Find the brand
  const { data: brand } = await supabaseAdmin
    .from('brands')
    .select('id, subscription_status')
    .eq('slug', slug)
    .single()

  if (!brand) {
    return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
  }

  if (brand.subscription_status === 'suspended') {
    return NextResponse.json({ error: 'This page is currently offline' }, { status: 403 })
  }

  // Find matching viewer code
  const { data: viewerCode } = await supabaseAdmin
    .from('viewer_codes')
    .select('id, expires_at, revoked')
    .eq('brand_id', brand.id)
    .eq('code', code.trim().toUpperCase())
    .single()

  if (!viewerCode) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
  }

  if (viewerCode.revoked) {
    return NextResponse.json({ error: 'This code has been revoked' }, { status: 401 })
  }

  if (viewerCode.expires_at && new Date(viewerCode.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This code has expired' }, { status: 401 })
  }

  // Log usage
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  await supabaseAdmin.from('viewer_code_uses').insert({
    viewer_code_id: viewerCode.id,
    ip_address: ip,
    user_agent: userAgent,
  })

  // Set session cookie scoped to this brand
  const cookieStore = await cookies()
  const expiresAt = viewerCode.expires_at ? new Date(viewerCode.expires_at) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

  cookieStore.set(`viewer_session_${slug}`, viewerCode.id, {
    expires: expiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return NextResponse.json({ success: true })
}
