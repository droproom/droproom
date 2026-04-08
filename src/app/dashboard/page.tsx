import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { TaglineEditor } from '@/app/components/tagline-editor'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: brand } = await supabaseAdmin
    .from('brands')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!brand) redirect('/login')

  const { count: dropCount } = await supabaseAdmin
    .from('drops')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', brand.id)

  const { count: codeCount } = await supabaseAdmin
    .from('viewer_codes')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', brand.id)
    .eq('revoked', false)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold tracking-wide uppercase mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-xs text-muted uppercase tracking-widest mb-1">Drops</p>
          <p className="text-3xl font-bold">
            {dropCount ?? 0}
            <span className="text-sm text-muted font-normal"> / {brand.max_drops}</span>
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-xs text-muted uppercase tracking-widest mb-1">Active Codes</p>
          <p className="text-3xl font-bold">{codeCount ?? 0}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5 mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted uppercase tracking-widest mb-2">Your Page</p>
          <p className="text-sm text-gold font-mono">
            /{brand.slug}
          </p>
        </div>
        <Link
          href={`/${brand.slug}`}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-md border border-gold text-gold px-4 py-2 text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors"
        >
          View Page
        </Link>
      </div>

      <div className="mb-6">
        <TaglineEditor currentTagline={brand.tagline} />
      </div>

      <div className="flex gap-3">
        <Link
          href="/dashboard/drops"
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface-hover transition-colors"
        >
          Manage Drops
        </Link>
        <Link
          href="/dashboard/codes"
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface-hover transition-colors"
        >
          Viewer Codes
        </Link>
      </div>
    </div>
  )
}
