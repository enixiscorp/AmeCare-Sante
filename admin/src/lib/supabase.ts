import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour TypeScript
export interface Invoice {
  id: string
  invoice_number: string
  user_id: string
  client_name: string | null
  client_email: string | null
  client_phone: string | null
  client_address: string | null
  structure_name: string
  invoice_date: string
  service_period: string | null
  total_ht: number
  total_tva: number
  total_ttc: number
  currency: string
  payment_terms: string | null
  payment_deadline: string | null
  payment_methods: string | null
  legal_mention: string | null
  invoice_data: any // JSONB
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  two_factor_enabled: boolean
  last_login: string | null
  created_at: string
}

export interface MonthlyStats {
  total_invoices: number
  total_revenue: number
  unique_clients: number
  unique_users: number
}

