import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS. Only use in API routes and server actions
// that need to access data without user auth (e.g., public brand pages for buyers).
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
