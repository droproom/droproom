import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { DashboardNav } from '@/app/components/dashboard-nav'
import type { Brand } from '@/lib/types'

export default async function DashboardLayout({
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
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!brand) redirect('/login')

  const typedBrand = brand as Brand

  return (
    <div className="flex flex-col md:flex-row min-h-dvh">
      <DashboardNav brand={typedBrand} />
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  )
}
