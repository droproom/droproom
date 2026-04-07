import { supabaseAdmin } from '@/lib/supabase-admin'
import { BrandList } from '@/app/components/brand-list'
import { InviteCodeGen } from '@/app/components/invite-code-gen'
import type { Brand, BrandInviteCode } from '@/lib/types'

export default async function OwnerPage() {
  // Fetch all brands
  const { data: brands } = await supabaseAdmin
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false })

  // Get drop counts for each brand
  const brandsWithCounts = await Promise.all(
    (brands ?? []).map(async (brand) => {
      const { count } = await supabaseAdmin
        .from('drops')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brand.id)

      return {
        ...(brand as Brand),
        drop_count: count ?? 0,
      }
    })
  )

  // Fetch invite codes
  const { data: inviteCodes } = await supabaseAdmin
    .from('brand_invite_codes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold tracking-wide uppercase mb-8">
        Owner Dashboard
      </h1>

      <div className="mb-10">
        <InviteCodeGen existingCodes={(inviteCodes ?? []) as BrandInviteCode[]} />
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted mb-4">
          All Brands
        </h2>
        <BrandList brands={brandsWithCounts} />
      </div>
    </div>
  )
}
