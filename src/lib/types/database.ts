export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          owner_user_id: string
          slug: string
          ghl_webhook_url: string
          default_tag: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_user_id: string
          slug: string
          ghl_webhook_url: string
          default_tag?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_user_id?: string
          slug?: string
          ghl_webhook_url?: string
          default_tag?: string | null
          created_at?: string
        }
      }
      intakes: {
        Row: {
          id: string
          tenant_id: string
          payload: Record<string, unknown>
          duration_sec: number | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          payload: Record<string, unknown>
          duration_sec?: number | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          payload?: Record<string, unknown>
          duration_sec?: number | null
          status?: string
          created_at?: string
        }
      }
    }
  }
}