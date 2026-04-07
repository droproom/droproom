import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: brand } = await supabaseAdmin
    .from('brands')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!brand) redirect('/login')

  // Get all viewer codes with their usage stats
  const { data: codes } = await supabaseAdmin
    .from('viewer_codes')
    .select(`
      id,
      code,
      expires_at,
      revoked,
      created_at,
      viewer_code_uses (
        id,
        used_at,
        ip_address
      )
    `)
    .eq('brand_id', brand.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold tracking-wide uppercase mb-8">
        Analytics
      </h1>

      {!codes || codes.length === 0 ? (
        <p className="text-sm text-muted">No viewer codes to analyze yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {codes.map((code) => {
            const uses = code.viewer_code_uses as { id: string; used_at: string; ip_address: string | null }[]
            const uniqueIPs = new Set(uses.map((u) => u.ip_address).filter(Boolean)).size
            const lastUsed = uses.length > 0
              ? new Date(uses[0].used_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : 'Never'

            const isExpired = new Date(code.expires_at) < new Date()
            const status = code.revoked
              ? 'Revoked'
              : isExpired
                ? 'Expired'
                : 'Active'

            return (
              <div
                key={code.id}
                className="rounded-md border border-border bg-surface p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono text-sm tracking-[0.15em]">{code.code}</p>
                  <span
                    className={`text-xs font-medium uppercase ${
                      status === 'Active'
                        ? 'text-green-400'
                        : status === 'Revoked'
                          ? 'text-red-400'
                          : 'text-muted'
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted uppercase">Total Uses</p>
                    <p className="text-lg font-bold">{uses.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase">Unique IPs</p>
                    <p className="text-lg font-bold">{uniqueIPs}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase">Last Used</p>
                    <p className="text-sm">{lastUsed}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
