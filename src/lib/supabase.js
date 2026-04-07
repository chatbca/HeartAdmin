import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env file')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const SITES = {
  knownv: '47da696a-f827-4e44-a651-4d8905db19b1',
  heartware: '01aa78e5-f988-47c3-9405-934f6bf69952'
}
