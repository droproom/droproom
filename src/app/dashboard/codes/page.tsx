import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { ViewerCodeForm } from '@/app/components/viewer-code-form'
import { ViewerCodeList } from '@/app/components/viewer-code-list'
import type { ViewerCode } from '@/lib/types'

export default async function CodesPage() {
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

  const { data: codes } = await supabaseAdmin
    .from('viewer_codes')
    .select('*')
    .eq('brand_id', brand.id)
    .order('created_at', { ascending: false })

  const typedCodes = (codes ?? []) as ViewerCode[]

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold tracking-wide uppercase mb-8">
        Viewer Codes
      </h1>

      <ViewerCodeForm />

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted mb-4">
          All Codes
        </h2>
        <ViewerCodeList codes={typedCodes} />
      </div>
    </div>
  )
}
