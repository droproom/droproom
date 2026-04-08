import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Verify session cookie
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(`viewer_session_${slug}`)

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify the viewer code is still valid
  const { data: viewerCode } = await supabaseAdmin
    .from('viewer_codes')
    .select('id, expires_at, revoked, brand_id')
    .eq('id', sessionCookie.value)
    .single()

  if (
    !viewerCode ||
    viewerCode.revoked ||
    (viewerCode.expires_at && new Date(viewerCode.expires_at) < new Date())
  ) {
    // Clear invalid cookie
    cookieStore.delete(`viewer_session_${slug}`)
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  // Fetch brand data
  const { data: brand } = await supabaseAdmin
    .from('brands')
    .select('id, name, slug, hero_video_url, tagline')
    .eq('slug', slug)
    .single()

  if (!brand) {
    return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
  }

  // Fetch drops
  const { data: drops } = await supabaseAdmin
    .from('drops')
    .select('id, name, media_url, media_type, sort_order')
    .eq('brand_id', brand.id)
    .order('sort_order', { ascending: true })

  // Fetch contacts
  const { data: contacts } = await supabaseAdmin
    .from('brand_contacts')
    .select('id, label, url, sort_order')
    .eq('brand_id', brand.id)
    .order('sort_order', { ascending: true })

  return NextResponse.json({
    brand: { name: brand.name, slug: brand.slug, hero_video_url: brand.hero_video_url, tagline: brand.tagline },
    drops: drops ?? [],
    contacts: contacts ?? [],
  })
}
