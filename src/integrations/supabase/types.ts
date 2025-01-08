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
      characters: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          bio_translations: Json | null
          city_id: string | null
          created_at: string | null
          gender: string | null
          id: string
          language_style: string[] | null
          language_style_translations: Json | null
          localized_image_url: string | null
          name: string
          name_translations: Json | null
          scenario_id: string | null
          topic: string
          updated_at: string | null
          voice_id: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          bio_translations?: Json | null
          city_id?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          language_style?: string[] | null
          language_style_translations?: Json | null
          localized_image_url?: string | null
          name: string
          name_translations?: Json | null
          scenario_id?: string | null
          topic: string
          updated_at?: string | null
          voice_id?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          bio_translations?: Json | null
          city_id?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          language_style?: string[] | null
          language_style_translations?: Json | null
          localized_image_url?: string | null
          name?: string
          name_translations?: Json | null
          scenario_id?: string | null
          topic?: string
          updated_at?: string | null
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "characters_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          character_id: number
          created_at: string | null
          current_line_index: number | null
          id: string
          messages: Json | null
          scenario_id: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          character_id: number
          created_at?: string | null
          current_line_index?: number | null
          id?: string
          messages?: Json | null
          scenario_id: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          character_id?: number
          created_at?: string | null
          current_line_index?: number | null
          id?: string
          messages?: Json | null
          scenario_id?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          country: string
          created_at: string | null
          cultural_notes: string | null
          id: string
          language_id: string | null
          local_slang: Json | null
          name: string
          updated_at: string | null
        }
        Insert: {
          country: string
          created_at?: string | null
          cultural_notes?: string | null
          id?: string
          language_id?: string | null
          local_slang?: Json | null
          name: string
          updated_at?: string | null
        }
        Update: {
          country?: string
          created_at?: string | null
          cultural_notes?: string | null
          id?: string
          language_id?: string | null
          local_slang?: Json | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_tips: {
        Row: {
          created_at: string | null
          cultural_context: string | null
          id: string
          language_code: string
          tip_text: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cultural_context?: string | null
          id?: string
          language_code: string
          tip_text: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cultural_context?: string | null
          id?: string
          language_code?: string
          tip_text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_tips_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      default_scenarios: {
        Row: {
          description: string | null
          id: number
          image_url: string | null
          title: string
          topic: string
        }
        Insert: {
          description?: string | null
          id: number
          image_url?: string | null
          title: string
          topic: string
        }
        Update: {
          description?: string | null
          id?: number
          image_url?: string | null
          title?: string
          topic?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          created_at: string | null
          emoji: string | null
          features: string | null
          female_voice: string | null
          id: string
          male_voice: string | null
          name: string
          output_format: string | null
          pronunciation_config: Json | null
          sample_rate: number | null
          shortname_female: string | null
          shortname_male: string | null
          style_list: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          emoji?: string | null
          features?: string | null
          female_voice?: string | null
          id?: string
          male_voice?: string | null
          name: string
          output_format?: string | null
          pronunciation_config?: Json | null
          sample_rate?: number | null
          shortname_female?: string | null
          shortname_male?: string | null
          style_list?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          emoji?: string | null
          features?: string | null
          female_voice?: string | null
          id?: string
          male_voice?: string | null
          name?: string
          output_format?: string | null
          pronunciation_config?: Json | null
          sample_rate?: number | null
          shortname_female?: string | null
          shortname_male?: string | null
          style_list?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          custom_goals: string[] | null
          full_name: string | null
          id: string
          languages_learning: string[] | null
          learning_goals: string[] | null
          native_language: string | null
          onboarding_completed: boolean | null
          target_language: string | null
          updated_at: string
          username: string | null
          voice_preference: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          custom_goals?: string[] | null
          full_name?: string | null
          id: string
          languages_learning?: string[] | null
          learning_goals?: string[] | null
          native_language?: string | null
          onboarding_completed?: boolean | null
          target_language?: string | null
          updated_at?: string
          username?: string | null
          voice_preference?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          custom_goals?: string[] | null
          full_name?: string | null
          id?: string
          languages_learning?: string[] | null
          learning_goals?: string[] | null
          native_language?: string | null
          onboarding_completed?: boolean | null
          target_language?: string | null
          updated_at?: string
          username?: string | null
          voice_preference?: string | null
        }
        Relationships: []
      }
      reference_mappings: {
        Row: {
          numeric_id: number
          ref_type: string
          uuid_id: string | null
        }
        Insert: {
          numeric_id: number
          ref_type: string
          uuid_id?: string | null
        }
        Update: {
          numeric_id?: number
          ref_type?: string
          uuid_id?: string | null
        }
        Relationships: []
      }
      scripts: {
        Row: {
          audio_generated: boolean | null
          character_id: number
          created_at: string | null
          id: string
          language_code: string
          scenario_id: number
          script_data: Json
          topic_id: number
          updated_at: string | null
          user_gender: Database["public"]["Enums"]["user_gender"]
        }
        Insert: {
          audio_generated?: boolean | null
          character_id: number
          created_at?: string | null
          id?: string
          language_code: string
          scenario_id: number
          script_data: Json
          topic_id: number
          updated_at?: string | null
          user_gender: Database["public"]["Enums"]["user_gender"]
        }
        Update: {
          audio_generated?: boolean | null
          character_id?: number
          created_at?: string | null
          id?: string
          language_code?: string
          scenario_id?: number
          script_data?: Json
          topic_id?: number
          updated_at?: string | null
          user_gender?: Database["public"]["Enums"]["user_gender"]
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string | null
          description: string | null
          description_translations: Json | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          title: string
          title_translations: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_translations?: Json | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          title: string
          title_translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_translations?: Json | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          title?: string
          title_translations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tts_cache: {
        Row: {
          audio_url: string | null
          audio_url_normal: string | null
          audio_url_slow: string | null
          audio_url_very_slow: string | null
          created_at: string | null
          id: string
          language_code: string
          text_content: string
          text_hash: string
          updated_at: string | null
          voice_gender: string
        }
        Insert: {
          audio_url?: string | null
          audio_url_normal?: string | null
          audio_url_slow?: string | null
          audio_url_very_slow?: string | null
          created_at?: string | null
          id?: string
          language_code: string
          text_content: string
          text_hash: string
          updated_at?: string | null
          voice_gender: string
        }
        Update: {
          audio_url?: string | null
          audio_url_normal?: string | null
          audio_url_slow?: string | null
          audio_url_very_slow?: string | null
          created_at?: string | null
          id?: string
          language_code?: string
          text_content?: string
          text_hash?: string
          updated_at?: string | null
          voice_gender?: string
        }
        Relationships: []
      }
      user_scenarios: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          scenario_id: string
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          scenario_id: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          scenario_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_uuid_from_numeric_id: {
        Args: {
          ref_type: string
          num_id: number
        }
        Returns: string
      }
    }
    Enums: {
      sender_type: "user" | "agent"
      user_gender: "male" | "female"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
