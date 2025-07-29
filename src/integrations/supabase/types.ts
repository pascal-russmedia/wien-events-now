export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      events: {
        Row: {
          added_by: string
          added_by_email: string
          address: string | null
          category: string
          city: string | null
          created_at: string
          dates: Json
          description: string
          featured: boolean
          host: string | null
          id: string
          image: string | null
          link: string | null
          name: string
          popularity_score: number | null
          price_amount: number | null
          price_type: string
          region: string
          state: string
          subcategory: string | null
          subregion: string | null
          ticket_link: string | null
          trust_score: number | null
          updated_at: string
        }
        Insert: {
          added_by: string
          added_by_email: string
          address?: string | null
          category: string
          city?: string | null
          created_at?: string
          dates: Json
          description: string
          featured?: boolean
          host?: string | null
          id?: string
          image?: string | null
          link?: string | null
          name: string
          popularity_score?: number | null
          price_amount?: number | null
          price_type?: string
          region: string
          state?: string
          subcategory?: string | null
          subregion?: string | null
          ticket_link?: string | null
          trust_score?: number | null
          updated_at?: string
        }
        Update: {
          added_by?: string
          added_by_email?: string
          address?: string | null
          category?: string
          city?: string | null
          created_at?: string
          dates?: Json
          description?: string
          featured?: boolean
          host?: string | null
          id?: string
          image?: string | null
          link?: string | null
          name?: string
          popularity_score?: number | null
          price_amount?: number | null
          price_type?: string
          region?: string
          state?: string
          subcategory?: string | null
          subregion?: string | null
          ticket_link?: string | null
          trust_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_expanded_future_events: {
        Args: {
          region_filter?: string
          category_filter?: string
          subcategory_filter?: string
          start_date_filter?: string
          end_date_filter?: string
          single_date_filter?: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          name: string
          category: string
          subcategory: string
          description: string
          region: string
          subregion: string
          city: string
          host: string
          address: string
          state: string
          popularity_score: number
          event_date: string
          start_time: string
          end_time: string
          image: string
          price_type: string
          price_amount: number
          link: string
          featured: boolean
          created_at: string
          updated_at: string
          total_count: number
        }[]
      }
      get_export_events: {
        Args: {
          search_date: string
          region_filter?: string
          category_filter?: string
          subcategory_filter?: string
        }
        Returns: {
          id: string
          name: string
          category: string
          subcategory: string
          description: string
          region: string
          subregion: string
          city: string
          host: string
          address: string
          state: string
          popularity_score: number
          trust_score: number
          dates: Json
          image: string
          price_type: string
          price_amount: number
          link: string
          featured: boolean
          added_by: string
          added_by_email: string
          created_at: string
          updated_at: string
        }[]
      }
      get_future_events_by_state: {
        Args: {
          state_filter?: string
          page_number?: number
          page_size?: number
        }
        Returns: {
          id: string
          name: string
          category: string
          subcategory: string
          description: string
          region: string
          subregion: string
          host: string
          address: string
          state: string
          popularity_score: number
          trust_score: number
          dates: Json
          image: string
          price_type: string
          price_amount: number
          link: string
          featured: boolean
          added_by: string
          added_by_email: string
          created_at: string
          updated_at: string
          pending_count: number
          approved_count: number
          rejected_count: number
          total_count: number
          current_state_total: number
          current_state_pages: number
        }[]
      }
      get_home_page_events: {
        Args: { region_filter?: string }
        Returns: {
          id: string
          name: string
          category: string
          subcategory: string
          description: string
          region: string
          subregion: string
          city: string
          host: string
          address: string
          state: string
          popularity_score: number
          event_date: string
          start_time: string
          end_time: string
          image: string
          price_type: string
          price_amount: number
          link: string
          featured: boolean
          created_at: string
          updated_at: string
        }[]
      }
      get_past_events_by_state: {
        Args: {
          state_filter?: string
          page_number?: number
          page_size?: number
        }
        Returns: {
          id: string
          name: string
          category: string
          subcategory: string
          description: string
          region: string
          subregion: string
          host: string
          address: string
          state: string
          popularity_score: number
          trust_score: number
          dates: Json
          image: string
          price_type: string
          price_amount: number
          link: string
          featured: boolean
          added_by: string
          added_by_email: string
          created_at: string
          updated_at: string
          pending_count: number
          approved_count: number
          rejected_count: number
          total_count: number
          current_state_total: number
          current_state_pages: number
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      search_similar_events: {
        Args: { event_name: string; event_region: string; event_city: string }
        Returns: {
          id: string
          name: string
          event_date: string
          region: string
          subregion: string
          city: string
          host: string
          address: string
          similarity_score: number
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
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
