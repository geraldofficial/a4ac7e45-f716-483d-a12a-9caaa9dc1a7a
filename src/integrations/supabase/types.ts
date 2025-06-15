export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      content_ratings: {
        Row: {
          content_type: string
          created_at: string
          id: string
          profile_id: string
          rating: number | null
          review: string | null
          tmdb_id: number
          updated_at: string
        }
        Insert: {
          content_type: string
          created_at?: string
          id?: string
          profile_id: string
          rating?: number | null
          review?: string | null
          tmdb_id: number
          updated_at?: string
        }
        Update: {
          content_type?: string
          created_at?: string
          id?: string
          profile_id?: string
          rating?: number | null
          review?: string | null
          tmdb_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_ratings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_subscriptions: {
        Row: {
          created_at: string
          email: string
          frequency: string
          id: string
          is_active: boolean
          last_sent_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          email_welcomed: boolean | null
          full_name: string | null
          genre_preferences: number[] | null
          id: string
          onboarding_completed: boolean | null
          updated_at: string
          username: string | null
          watchlist: number[] | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email_welcomed?: boolean | null
          full_name?: string | null
          genre_preferences?: number[] | null
          id: string
          onboarding_completed?: boolean | null
          updated_at?: string
          username?: string | null
          watchlist?: number[] | null
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email_welcomed?: boolean | null
          full_name?: string | null
          genre_preferences?: number[] | null
          id?: string
          onboarding_completed?: boolean | null
          updated_at?: string
          username?: string | null
          watchlist?: number[] | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age_restriction: number | null
          avatar: string | null
          created_at: string
          id: string
          is_child: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age_restriction?: number | null
          avatar?: string | null
          created_at?: string
          id?: string
          is_child?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          age_restriction?: number | null
          avatar?: string | null
          created_at?: string
          id?: string
          is_child?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      viewing_preferences: {
        Row: {
          auto_play: boolean | null
          content_filter: string | null
          created_at: string
          id: string
          preferred_genres: number[] | null
          preferred_languages: string[] | null
          profile_id: string
          subtitle_language: string | null
          updated_at: string
        }
        Insert: {
          auto_play?: boolean | null
          content_filter?: string | null
          created_at?: string
          id?: string
          preferred_genres?: number[] | null
          preferred_languages?: string[] | null
          profile_id: string
          subtitle_language?: string | null
          updated_at?: string
        }
        Update: {
          auto_play?: boolean | null
          content_filter?: string | null
          created_at?: string
          id?: string
          preferred_genres?: number[] | null
          preferred_languages?: string[] | null
          profile_id?: string
          subtitle_language?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewing_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_progress: {
        Row: {
          completed: boolean | null
          content_type: string
          created_at: string
          duration_seconds: number | null
          episode: number | null
          id: string
          last_watched_at: string
          profile_id: string
          progress_seconds: number | null
          season: number | null
          tmdb_id: number
        }
        Insert: {
          completed?: boolean | null
          content_type: string
          created_at?: string
          duration_seconds?: number | null
          episode?: number | null
          id?: string
          last_watched_at?: string
          profile_id: string
          progress_seconds?: number | null
          season?: number | null
          tmdb_id: number
        }
        Update: {
          completed?: boolean | null
          content_type?: string
          created_at?: string
          duration_seconds?: number | null
          episode?: number | null
          id?: string
          last_watched_at?: string
          profile_id?: string
          progress_seconds?: number | null
          season?: number | null
          tmdb_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "watch_progress_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
