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
      challenge_completions: {
        Row: {
          challenge_id: string
          child_id: string
          completed_at: string
          created_at: string
          duration_seconds: number
          id: string
          photo_url: string | null
          points_awarded: number
        }
        Insert: {
          challenge_id: string
          child_id: string
          completed_at?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          photo_url?: string | null
          points_awarded: number
        }
        Update: {
          challenge_id?: string
          child_id?: string
          completed_at?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          photo_url?: string | null
          points_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenge_completions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      child_profiles: {
        Row: {
          active_accessories: string[] | null
          active_animation: string | null
          active_pet_color: string | null
          active_theme: string | null
          badges: string[] | null
          child_age: number
          child_name: string
          completed_activities: string[] | null
          created_at: string
          current_chapter: number | null
          id: string
          last_activity_date: string | null
          parent_id: string
          pet_energy: number | null
          pet_happiness: number | null
          pet_health: number | null
          pet_level: number | null
          pet_name: string | null
          play_space: string
          screen_time_today: number | null
          total_points: number | null
          updated_at: string
        }
        Insert: {
          active_accessories?: string[] | null
          active_animation?: string | null
          active_pet_color?: string | null
          active_theme?: string | null
          badges?: string[] | null
          child_age: number
          child_name: string
          completed_activities?: string[] | null
          created_at?: string
          current_chapter?: number | null
          id?: string
          last_activity_date?: string | null
          parent_id: string
          pet_energy?: number | null
          pet_happiness?: number | null
          pet_health?: number | null
          pet_level?: number | null
          pet_name?: string | null
          play_space: string
          screen_time_today?: number | null
          total_points?: number | null
          updated_at?: string
        }
        Update: {
          active_accessories?: string[] | null
          active_animation?: string | null
          active_pet_color?: string | null
          active_theme?: string | null
          badges?: string[] | null
          child_age?: number
          child_name?: string
          completed_activities?: string[] | null
          created_at?: string
          current_chapter?: number | null
          id?: string
          last_activity_date?: string | null
          parent_id?: string
          pet_energy?: number | null
          pet_happiness?: number | null
          pet_health?: number | null
          pet_level?: number | null
          pet_name?: string | null
          play_space?: string
          screen_time_today?: number | null
          total_points?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      child_purchases: {
        Row: {
          child_id: string
          id: string
          purchased_at: string
          shop_item_id: string
        }
        Insert: {
          child_id: string
          id?: string
          purchased_at?: string
          shop_item_id: string
        }
        Update: {
          child_id?: string
          id?: string
          purchased_at?: string
          shop_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_purchases_shop_item_id_fkey"
            columns: ["shop_item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          daily_activity_time: number | null
          email: string
          id: string
          parent_name: string
          screen_time_limit: number | null
          timezone: string | null
          updated_at: string
          weather_access_enabled: boolean | null
        }
        Insert: {
          created_at?: string
          daily_activity_time?: number | null
          email: string
          id: string
          parent_name: string
          screen_time_limit?: number | null
          timezone?: string | null
          updated_at?: string
          weather_access_enabled?: boolean | null
        }
        Update: {
          created_at?: string
          daily_activity_time?: number | null
          email?: string
          id?: string
          parent_name?: string
          screen_time_limit?: number | null
          timezone?: string | null
          updated_at?: string
          weather_access_enabled?: boolean | null
        }
        Relationships: []
      }
      shop_items: {
        Row: {
          cost: number
          created_at: string
          description: string
          id: string
          image_url: string | null
          name: string
          preview_data: Json | null
          type: string
        }
        Insert: {
          cost: number
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          name: string
          preview_data?: Json | null
          type: string
        }
        Update: {
          cost?: number
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          preview_data?: Json | null
          type?: string
        }
        Relationships: []
      }
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
