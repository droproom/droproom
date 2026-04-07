import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { DropCard } from '@/app/components/drop-card'
import { DropUpload } from '@/app/components/drop-upload'
import { HeroVideoUpload } from '@/app/components/hero-video-upload'
import type { Drop } from '@/lib/types'

export default async function DropsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: brand } = await supabaseAdmin
    .from('brands')
    .select('id, max_drops, hero_video_url')
    .eq('user_id', user.id)
    .single()

  if (!brand) redirect('/login')

  const { data: drops } = await supabaseAdmin
    .from('drops')
    .select('*')
    .eq('brand_id', brand.id)
    .order('sort_order', { ascending: true })

  const typedDrops = (drops ?? []) as Drop[]

  return (
    <div>
      {/* Hero Video Section */}
      <div className="mb-10">
        <HeroVideoUpload currentUrl={brand.hero_video_url} />
      </div>

      {/* Drops Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-wide uppercase">Drops</h1>
          <p className="text-sm text-muted mt-1">
            {typedDrops.length} / {brand.max_drops} slots used
          </p>
        </div>
        <DropUpload currentCount={typedDrops.length} maxDrops={brand.max_drops} />
      </div>

      {typedDrops.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted">No drops yet. Add your first drop above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {typedDrops.map((drop) => (
            <DropCard key={drop.id} drop={drop} />
          ))}
        </div>
      )}
    </div>
  )
}
