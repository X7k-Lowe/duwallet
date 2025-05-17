export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string // uuid, links to auth.users.id
          created_at: string // timestamp with time zone, default now()
          updated_at: string // timestamp with time zone, default now()
          user_name: string | null // text
          gender: string | null // text (e.g., 'male', 'female', 'other')
          // avatar_url: string | null // text, if you plan to store avatar urls
          // activated_at: string | null // timestamp for when user completed any necessary setup
        }
        Insert: {
          id: string // Must match auth.users.id
          created_at?: string
          updated_at?: string
          user_name?: string | null
          gender?: string | null
          // avatar_url?: string | null
          // activated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_name?: string | null
          gender?: string | null
          // avatar_url?: string | null
          // activated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey'
            columns: ['id']
            referencedRelation: 'users' // This refers to auth.users table in Supabase
            referencedColumns: ['id']
          }
        ]
      }
      // wallets: { ... } // Placeholder for future wallet table
      // transactions: { ... } // Placeholder for future transactions table
      // categories: { ... } // Placeholder for future categories table
      // user_wallets: { ... } // Placeholder for user-wallet link table
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 