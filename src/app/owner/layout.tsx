import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: brand } = await supabaseAdmin
    .from('brands')
    .select('is_owner')
    .eq('user_id', user.id)
    .single()

  if (!brand?.is_owner) redirect('/dashboard')

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-bold tracking-[0.2em] uppercase text-gold">
            Droproom
          </Link>
          <span className="text-xs text-muted uppercase tracking-widest">Owner</span>
        </div>
        <Link
          href="/dashboard"
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          My Dashboard
        </Link>
      </header>
      <main className="p-6 md:p-10">{children}</main>
    </div>
  )
}
