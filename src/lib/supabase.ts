import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from "@/utils/supabase/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
// Use Service Role Key for server-side fetching to bypass RLS during MVP, fallback to ANON key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function getUserId() {
  const ssrClient = await createServerClient()
  const { data: { user } } = await ssrClient.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user.id
}
