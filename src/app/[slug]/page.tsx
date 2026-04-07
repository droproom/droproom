import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { CodeEntry } from '@/app/components/code-entry'
import { DropGrid } from '@/app/components/drop-grid'

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Check if this brand exists
  const { data: brand } = await supabaseAdmin
    .from('brands')
    .select('id, name, slug, subscription_status')
    .eq('slug', slug)
    .single()

  if (!brand) notFound()

  // Check if suspended
  if (brand.subscription_status === 'suspended') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-dvh px-4">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-px bg-border mx-auto mb-6" />
          <p className="text-muted text-sm">This page is currently offline.</p>
        </div>
      </div>
    )
  }

  // Check for valid session cookie
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(`viewer_session_${slug}`)

  let hasValidSession = false

  if (sessionCookie) {
    const { data: viewerCode } = await supabaseAdmin
      .from('viewer_codes')
      .select('id, expires_at, revoked')
      .eq('id', sessionCookie.value)
      .single()

    if (
      viewerCode &&
      !viewerCode.revoked &&
      new Date(viewerCode.expires_at) > new Date()
    ) {
      hasValidSession = true
    }
  }

  if (!hasValidSession) {
    return <CodeEntry slug={slug} />
  }

  return <DropGrid slug={slug} />
}
