export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      crawl_queue: {
        Row: {
          done_at: string | null
          id: number
          picked_at: string | null
          scheduled_at: string | null
          source_id: number | null
          status: string | null
          url: string
        }
        Insert: {
          done_at?: string | null
          id?: number
          picked_at?: string | null
          scheduled_at?: string | null
          source_id?: number | null
          status?: string | null
          url: string
        }
        Update: {
          done_at?: string | null
          id?: number
          picked_at?: string | null
          scheduled_at?: string | null
          source_id?: number | null
          status?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "crawl_queue_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      crawl_results: {
        Row: {
          confidence: number | null
          created_at: string | null
          discovered_category: string | null
          discovered_dbfit: string | null
          discovered_name: string | null
          discovered_site: string | null
          discovered_slug: string | null
          id: number
          raw: Json | null
          snippet: string | null
          source_id: number | null
          title: string | null
          url: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          discovered_category?: string | null
          discovered_dbfit?: string | null
          discovered_name?: string | null
          discovered_site?: string | null
          discovered_slug?: string | null
          id?: number
          raw?: Json | null
          snippet?: string | null
          source_id?: number | null
          title?: string | null
          url?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          discovered_category?: string | null
          discovered_dbfit?: string | null
          discovered_name?: string | null
          discovered_site?: string | null
          discovered_slug?: string | null
          id?: number
          raw?: Json | null
          snippet?: string | null
          source_id?: number | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crawl_results_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      edit_proposals: {
        Row: {
          created_at: string | null
          id: number
          payment_status: string | null
          product_id: number | null
          proposed_cons: string | null
          proposed_overview: string | null
          proposed_pros: string | null
          proposed_tags: string | null
          proposer_claim: string | null
          proposer_email: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          payment_status?: string | null
          product_id?: number | null
          proposed_cons?: string | null
          proposed_overview?: string | null
          proposed_pros?: string | null
          proposed_tags?: string | null
          proposer_claim?: string | null
          proposer_email?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          payment_status?: string | null
          product_id?: number | null
          proposed_cons?: string | null
          proposed_overview?: string | null
          proposed_pros?: string | null
          proposed_tags?: string | null
          proposer_claim?: string | null
          proposer_email?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edit_proposals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edit_proposals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string
          id: number
          product_id: number | null
          proposal_id: number | null
          status: string
          stripe_payment_intent: string | null
          stripe_session_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency?: string
          id?: number
          product_id?: number | null
          proposal_id?: number | null
          status: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string
          id?: number
          product_id?: number | null
          proposal_id?: number | null
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "edit_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      product_submissions: {
        Row: {
          ai_builder: boolean
          byo_postgres: boolean
          category_type: string
          complexity_hint: number | null
          cons_short: string | null
          created_at: string | null
          db_fit: string
          deploy_path: string | null
          designer_first: boolean
          difficulty_hint: number | null
          enterprise_ready: boolean
          first_class_neon: boolean
          first_class_supabase: boolean
          id: number
          name: string
          oss: boolean
          overview_short: string | null
          pricing_model: string | null
          pros_short: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitter_email: string | null
          submitter_notes: string | null
          tags: string | null
          url: string | null
          use_case_category: string | null
        }
        Insert: {
          ai_builder?: boolean
          byo_postgres?: boolean
          category_type: string
          complexity_hint?: number | null
          cons_short?: string | null
          created_at?: string | null
          db_fit: string
          deploy_path?: string | null
          designer_first?: boolean
          difficulty_hint?: number | null
          enterprise_ready?: boolean
          first_class_neon?: boolean
          first_class_supabase?: boolean
          id?: never
          name: string
          oss?: boolean
          overview_short?: string | null
          pricing_model?: string | null
          pros_short?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitter_email?: string | null
          submitter_notes?: string | null
          tags?: string | null
          url?: string | null
          use_case_category?: string | null
        }
        Update: {
          ai_builder?: boolean
          byo_postgres?: boolean
          category_type?: string
          complexity_hint?: number | null
          cons_short?: string | null
          created_at?: string | null
          db_fit?: string
          deploy_path?: string | null
          designer_first?: boolean
          difficulty_hint?: number | null
          enterprise_ready?: boolean
          first_class_neon?: boolean
          first_class_supabase?: boolean
          id?: never
          name?: string
          oss?: boolean
          overview_short?: string | null
          pricing_model?: string | null
          pros_short?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitter_email?: string | null
          submitter_notes?: string | null
          tags?: string | null
          url?: string | null
          use_case_category?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          ai_builder: boolean
          avg_rating: number | null
          byo_postgres: boolean
          category_type: string
          complexity_hint: number | null
          cons_short: string | null
          created_at: string | null
          db_fit: string
          deploy_path: string | null
          designer_first: boolean
          difficulty_hint: number | null
          enterprise_ready: boolean
          first_class_neon: boolean
          first_class_supabase: boolean
          id: number
          name: string
          oss: boolean
          overview_short: string | null
          pricing_model: string | null
          pros_short: string | null
          slug: string
          tags: string | null
          url: string | null
          use_case_category: string | null
          vote_count: number | null
        }
        Insert: {
          ai_builder?: boolean
          avg_rating?: number | null
          byo_postgres?: boolean
          category_type: string
          complexity_hint?: number | null
          cons_short?: string | null
          created_at?: string | null
          db_fit: string
          deploy_path?: string | null
          designer_first?: boolean
          difficulty_hint?: number | null
          enterprise_ready?: boolean
          first_class_neon?: boolean
          first_class_supabase?: boolean
          id?: number
          name: string
          oss?: boolean
          overview_short?: string | null
          pricing_model?: string | null
          pros_short?: string | null
          slug: string
          tags?: string | null
          url?: string | null
          use_case_category?: string | null
          vote_count?: number | null
        }
        Update: {
          ai_builder?: boolean
          avg_rating?: number | null
          byo_postgres?: boolean
          category_type?: string
          complexity_hint?: number | null
          cons_short?: string | null
          created_at?: string | null
          db_fit?: string
          deploy_path?: string | null
          designer_first?: boolean
          difficulty_hint?: number | null
          enterprise_ready?: boolean
          first_class_neon?: boolean
          first_class_supabase?: boolean
          id?: number
          name?: string
          oss?: boolean
          overview_short?: string | null
          pricing_model?: string | null
          pros_short?: string | null
          slug?: string
          tags?: string | null
          url?: string | null
          use_case_category?: string | null
          vote_count?: number | null
        }
        Relationships: []
      }
      sources: {
        Row: {
          active: boolean | null
          id: number
          name: string
          type: string
          url: string
          weight: number | null
        }
        Insert: {
          active?: boolean | null
          id?: number
          name: string
          type: string
          url: string
          weight?: number | null
        }
        Update: {
          active?: boolean | null
          id?: number
          name?: string
          type?: string
          url?: string
          weight?: number | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          anon_id: string
          created_at: string | null
          id: number
          product_id: number | null
          rating: number
        }
        Insert: {
          anon_id: string
          created_at?: string | null
          id?: number
          product_id?: number | null
          rating: number
        }
        Update: {
          anon_id?: string
          created_at?: string | null
          id?: number
          product_id?: number | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "votes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      product_scores: {
        Row: {
          ai_builder: boolean | null
          avg_rating: number | null
          byo_postgres: boolean | null
          category_type: string | null
          complexity_hint: number | null
          cons_short: string | null
          created_at: string | null
          db_fit: string | null
          deploy_path: string | null
          designer_first: boolean | null
          difficulty_hint: number | null
          enterprise_ready: boolean | null
          first_class_neon: boolean | null
          first_class_supabase: boolean | null
          id: number | null
          name: string | null
          oss: boolean | null
          overview_short: string | null
          pricing_model: string | null
          pros_short: string | null
          score: number | null
          slug: string | null
          tags: string | null
          url: string | null
          use_case_category: string | null
          vote_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      increment_vote: {
        Args: { p_tool: string; p_vote_type: string }
        Returns: undefined
      }
      refresh_product_scores: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
