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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          id: number
          kind: string
          latency_ms: number | null
          metadata: Json
          owner_id: string
          project_id: string | null
          provider: Database["public"]["Enums"]["ai_provider"] | null
          tokens_input: number
          tokens_output: number
        }
        Insert: {
          created_at?: string
          id?: number
          kind: string
          latency_ms?: number | null
          metadata?: Json
          owner_id: string
          project_id?: string | null
          provider?: Database["public"]["Enums"]["ai_provider"] | null
          tokens_input?: number
          tokens_output?: number
        }
        Update: {
          created_at?: string
          id?: number
          kind?: string
          latency_ms?: number | null
          metadata?: Json
          owner_id?: string
          project_id?: string | null
          provider?: Database["public"]["Enums"]["ai_provider"] | null
          tokens_input?: number
          tokens_output?: number
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          label: string | null
          last4: string | null
          owner_id: string
          provider: string
          secret_ref: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          label?: string | null
          last4?: string | null
          owner_id: string
          provider: string
          secret_ref: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          label?: string | null
          last4?: string | null
          owner_id?: string
          provider?: string
          secret_ref?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: number
          metadata: Json
          owner_id: string
          project_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: number
          metadata?: Json
          owner_id: string
          project_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: number
          metadata?: Json
          owner_id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_summaries: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          owner_id: string
          project_id: string
          summary: string
          tokens: number
          up_to_message_id: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          owner_id: string
          project_id: string
          summary: string
          tokens?: number
          up_to_message_id?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          owner_id?: string
          project_id?: string
          summary?: string
          tokens?: number
          up_to_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_summaries_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_summaries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_summaries_up_to_message_id_fkey"
            columns: ["up_to_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          project_id: string
          provider: Database["public"]["Enums"]["ai_provider"]
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          project_id: string
          provider: Database["public"]["Enums"]["ai_provider"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          project_id?: string
          provider?: Database["public"]["Enums"]["ai_provider"]
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      handoffs: {
        Row: {
          created_at: string
          extra_context: string | null
          id: string
          included_file_ids: string[]
          included_memory_ids: string[]
          owner_id: string
          project_id: string
          source_conversation_id: string | null
          source_message_id: string | null
          source_provider: string
          target_conversation_id: string | null
          target_message_id: string | null
          target_provider: string
        }
        Insert: {
          created_at?: string
          extra_context?: string | null
          id?: string
          included_file_ids?: string[]
          included_memory_ids?: string[]
          owner_id: string
          project_id: string
          source_conversation_id?: string | null
          source_message_id?: string | null
          source_provider: string
          target_conversation_id?: string | null
          target_message_id?: string | null
          target_provider: string
        }
        Update: {
          created_at?: string
          extra_context?: string | null
          id?: string
          included_file_ids?: string[]
          included_memory_ids?: string[]
          owner_id?: string
          project_id?: string
          source_conversation_id?: string | null
          source_message_id?: string | null
          source_provider?: string
          target_conversation_id?: string | null
          target_message_id?: string | null
          target_provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "handoffs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handoffs_source_conversation_id_fkey"
            columns: ["source_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handoffs_source_message_id_fkey"
            columns: ["source_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handoffs_target_conversation_id_fkey"
            columns: ["target_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handoffs_target_message_id_fkey"
            columns: ["target_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_embeddings: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: string
          memory_id: string
          owner_id: string
          project_id: string
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          memory_id: string
          owner_id: string
          project_id: string
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          memory_id?: string
          owner_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_embeddings_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "project_memory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_embeddings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string
          file_id: string
          id: string
          message_id: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          file_id: string
          id?: string
          message_id: string
          owner_id: string
        }
        Update: {
          created_at?: string
          file_id?: string
          id?: string
          message_id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "project_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          handoff_from: Database["public"]["Enums"]["ai_provider"] | null
          id: string
          latency_ms: number | null
          metadata: Json
          owner_id: string
          project_id: string
          provider: Database["public"]["Enums"]["ai_provider"]
          role: Database["public"]["Enums"]["message_role"]
          tokens_input: number
          tokens_output: number
        }
        Insert: {
          content?: string
          conversation_id: string
          created_at?: string
          handoff_from?: Database["public"]["Enums"]["ai_provider"] | null
          id?: string
          latency_ms?: number | null
          metadata?: Json
          owner_id: string
          project_id: string
          provider: Database["public"]["Enums"]["ai_provider"]
          role: Database["public"]["Enums"]["message_role"]
          tokens_input?: number
          tokens_output?: number
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          handoff_from?: Database["public"]["Enums"]["ai_provider"] | null
          id?: string
          latency_ms?: number | null
          metadata?: Json
          owner_id?: string
          project_id?: string
          provider?: Database["public"]["Enums"]["ai_provider"]
          role?: Database["public"]["Enums"]["message_role"]
          tokens_input?: number
          tokens_output?: number
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          owner_id: string
          project_id: string | null
          read_at: string | null
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          owner_id: string
          project_id?: string | null
          read_at?: string | null
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          owner_id?: string
          project_id?: string | null
          read_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_files: {
        Row: {
          created_at: string
          extracted_text: string | null
          id: string
          mime_type: string | null
          name: string
          owner_id: string
          project_id: string
          size_bytes: number | null
          storage_path: string
        }
        Insert: {
          created_at?: string
          extracted_text?: string | null
          id?: string
          mime_type?: string | null
          name: string
          owner_id: string
          project_id: string
          size_bytes?: number | null
          storage_path: string
        }
        Update: {
          created_at?: string
          extracted_text?: string | null
          id?: string
          mime_type?: string | null
          name?: string
          owner_id?: string
          project_id?: string
          size_bytes?: number | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          project_id: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          project_id: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          project_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_memory: {
        Row: {
          content: string
          created_at: string
          id: string
          owner_id: string
          pinned: boolean
          project_id: string
          source: Database["public"]["Enums"]["ai_provider"] | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          owner_id: string
          pinned?: boolean
          project_id: string
          source?: Database["public"]["Enums"]["ai_provider"] | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          owner_id?: string
          pinned?: boolean
          project_id?: string
          source?: Database["public"]["Enums"]["ai_provider"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_memory_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tags: {
        Row: {
          created_at: string
          owner_id: string
          project_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          owner_id: string
          project_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          owner_id?: string
          project_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tags_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          owner_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          owner_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          owner_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      provider_configs: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          max_tokens: number | null
          model: string | null
          owner_id: string
          project_id: string
          provider: string
          settings: Json
          system_prompt: string | null
          temperature: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          max_tokens?: number | null
          model?: string | null
          owner_id: string
          project_id: string
          provider: string
          settings?: Json
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          max_tokens?: number | null
          model?: string | null
          owner_id?: string
          project_id?: string
          provider?: string
          settings?: Json
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_configs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
      usage_daily: {
        Row: {
          cost_usd: number
          day: string
          id: string
          latency_ms_sum: number
          owner_id: string
          project_id: string | null
          provider: string
          requests: number
          tokens_input: number
          tokens_output: number
        }
        Insert: {
          cost_usd?: number
          day: string
          id?: string
          latency_ms_sum?: number
          owner_id: string
          project_id?: string | null
          provider: string
          requests?: number
          tokens_input?: number
          tokens_output?: number
        }
        Update: {
          cost_usd?: number
          day?: string
          id?: string
          latency_ms_sum?: number
          owner_id?: string
          project_id?: string | null
          provider?: string
          requests?: number
          tokens_input?: number
          tokens_output?: number
        }
        Relationships: [
          {
            foreignKeyName: "usage_daily_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_project: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_project_member: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      match_project_memory: {
        Args: { _limit?: number; _project_id: string; _query: string }
        Returns: {
          content: string
          id: string
          memory_id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      ai_provider: "chatgpt" | "claude" | "gemini" | "copilot"
      app_role: "admin" | "user"
      member_role: "owner" | "editor" | "viewer"
      message_role: "user" | "assistant" | "system"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ai_provider: ["chatgpt", "claude", "gemini", "copilot"],
      app_role: ["admin", "user"],
      member_role: ["owner", "editor", "viewer"],
      message_role: ["user", "assistant", "system"],
    },
  },
} as const
