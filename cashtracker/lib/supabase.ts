import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Sighting = {
  id: number
  created_at: string
  note_id: string
  city: string
  country: string
  handler_number: number
  note: string | null
  lat: number | null
  lon: number | null
}
