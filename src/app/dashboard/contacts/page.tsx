import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { ContactForm } from '@/app/components/contact-form'
import type { BrandContact } from '@/lib/types'

export default async function ContactsPage() {
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

  const { data: contacts } = await supabaseAdmin
    .from('brand_contacts')
    .select('*')
    .eq('brand_id', brand.id)
    .order('sort_order', { ascending: true })

  const typedContacts = (contacts ?? []) as BrandContact[]

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold tracking-wide uppercase mb-2">
        Contact Methods
      </h1>
      <p className="text-sm text-muted mb-8">
        Add up to 3 ways for buyers to reach you. These show on your public page.
      </p>
      <ContactForm contacts={typedContacts} />
    </div>
  )
}
