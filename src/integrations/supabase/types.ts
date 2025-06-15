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
      community_post_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          media_urls: string[] | null
          shares_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          shares_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_urls?: string[] | null
          shares_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_stories: {
        Row: {
          caption: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          media_type: string
          media_url: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          media_type: string
          media_url: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          media_type?: string
          media_url?: string
          user_id?: string
        }
        Relationships: []
      }
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
      direct_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          media_url: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_url?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_url?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
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
      watch_party_messages: {
        Row: {
          id: string
          message: string
          session_id: string
          timestamp: string | null
          type: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          id?: string
          message: string
          session_id: string
          timestamp?: string | null
          type?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          id?: string
          message?: string
          session_id?: string
          timestamp?: string | null
          type?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_party_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "watch_party_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_party_participants: {
        Row: {
          avatar: string | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          last_seen: string | null
          session_id: string
          user_id: string
          username: string
        }
        Insert: {
          avatar?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_seen?: string | null
          session_id: string
          user_id: string
          username: string
        }
        Update: {
          avatar?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_seen?: string | null
          session_id?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_party_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "watch_party_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_party_sessions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          host_id: string
          id: string
          is_playing: boolean | null
          last_activity: string | null
          movie_id: number
          movie_title: string
          movie_type: string
          playback_time: number | null
          sync_position: number | null
          sync_timestamp: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          host_id: string
          id: string
          is_playing?: boolean | null
          last_activity?: string | null
          movie_id: number
          movie_title: string
          movie_type: string
          playback_time?: number | null
          sync_position?: number | null
          sync_timestamp?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          host_id?: string
          id?: string
          is_playing?: boolean | null
          last_activity?: string | null
          movie_id?: number
          movie_title?: string
          movie_type?: string
          playback_time?: number | null
          sync_position?: number | null
          sync_timestamp?: string | null
        }
        Relationships: []
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
      cleanup_expired_stories: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_watch_party_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_is_in_session: {
        Args: { session_id_param: string }
        Returns: boolean
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
