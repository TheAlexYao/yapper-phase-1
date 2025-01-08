import { Character } from '@/types/database/characters';
import { ChatSession } from '@/types/database/chat';
import { Json } from '@/types/json';

export type { Json };

export interface Database {
  public: {
    Tables: {
      characters: {
        Row: Character;
        Insert: Partial<Character>;
        Update: Partial<Character>;
      };
      chat_sessions: {
        Row: ChatSession;
        Insert: Omit<ChatSession, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ChatSession, 'id' | 'created_at' | 'updated_at'>>;
      };
      default_scenarios: {
        Row: {
          description: string | null;
          id: string;
          image_url: string | null;
          title: string;
          topic: string;
        };
        Insert: {
          description?: string | null;
          id?: string;
          image_url?: string | null;
          title: string;
          topic: string;
        };
        Update: {
          description?: string | null;
          id?: string;
          image_url?: string | null;
          title?: string;
          topic?: string;
        };
        Relationships: [];
      };
      languages: {
        Row: {
          code: string;
          created_at: string | null;
          emoji: string | null;
          features: string | null;
          female_voice: string | null;
          id: string;
          male_voice: string | null;
          name: string;
          output_format: string | null;
          pronunciation_config: Json | null;
          sample_rate: number | null;
          shortname_female: string | null;
          shortname_male: string | null;
          style_list: string | null;
          updated_at: string | null;
        };
        Insert: {
          code: string;
          created_at?: string | null;
          emoji?: string | null;
          features?: string | null;
          female_voice?: string | null;
          id?: string;
          male_voice?: string | null;
          name: string;
          output_format?: string | null;
          pronunciation_config?: Json | null;
          sample_rate?: number | null;
          shortname_female?: string | null;
          shortname_male?: string | null;
          style_list?: string | null;
          updated_at?: string | null;
        };
        Update: {
          code?: string;
          created_at?: string | null;
          emoji?: string | null;
          features?: string | null;
          female_voice?: string | null;
          id?: string;
          male_voice?: string | null;
          name?: string;
          output_format?: string | null;
          pronunciation_config?: Json | null;
          sample_rate?: number | null;
          shortname_female?: string | null;
          shortname_male?: string | null;
          style_list?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          custom_goals: string[] | null;
          full_name: string | null;
          id: string;
          languages_learning: string[] | null;
          learning_goals: string[] | null;
          native_language: string | null;
          onboarding_completed: boolean | null;
          target_language: string | null;
          updated_at: string;
          username: string | null;
          voice_preference: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          custom_goals?: string[] | null;
          full_name?: string | null;
          id: string;
          languages_learning?: string[] | null;
          learning_goals?: string[] | null;
          native_language?: string | null;
          onboarding_completed?: boolean | null;
          target_language?: string | null;
          updated_at?: string;
          username?: string | null;
          voice_preference?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          custom_goals?: string[] | null;
          full_name?: string | null;
          id?: string;
          languages_learning?: string[] | null;
          learning_goals?: string[] | null;
          native_language?: string | null;
          onboarding_completed?: boolean | null;
          target_language?: string | null;
          updated_at?: string;
          username?: string | null;
          voice_preference?: string | null;
        };
        Relationships: [];
      };
      scripts: {
        Row: {
          audio_generated: boolean | null;
          character_id: number;
          created_at: string | null;
          id: string;
          language_code: string;
          scenario_id: string;
          script_data: Json;
          topic_id: number;
          updated_at: string | null;
          user_gender: Database["public"]["Enums"]["user_gender"];
        };
        Insert: {
          audio_generated?: boolean | null;
          character_id: number;
          created_at?: string | null;
          id?: string;
          language_code: string;
          scenario_id: string;
          script_data: Json;
          topic_id: number;
          updated_at?: string | null;
          user_gender: Database["public"]["Enums"]["user_gender"];
        };
        Update: {
          audio_generated?: boolean | null;
          character_id?: number;
          created_at?: string | null;
          id?: string;
          language_code?: string;
          scenario_id?: string;
          script_data?: Json;
          topic_id?: number;
          updated_at?: string | null;
          user_gender?: Database["public"]["Enums"]["user_gender"];
        };
        Relationships: [
          {
            foreignKeyName: "scripts_scenario_id_fkey";
            columns: ["scenario_id"];
            isOneToOne: false;
            referencedRelation: "default_scenarios";
            referencedColumns: ["id"];
          },
        ];
      };
      topics: {
        Row: {
          created_at: string | null;
          description: string | null;
          description_translations: Json | null;
          display_order: number | null;
          id: string;
          image_url: string | null;
          is_active: boolean | null;
          title: string;
          title_translations: Json | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          description_translations?: Json | null;
          display_order?: number | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean | null;
          title: string;
          title_translations?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          description_translations?: Json | null;
          display_order?: number | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean | null;
          title?: string;
          title_translations?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      tts_cache: {
        Row: {
          audio_url: string | null;
          audio_url_normal: string | null;
          audio_url_slow: string | null;
          audio_url_very_slow: string | null;
          created_at: string | null;
          id: string;
          language_code: string;
          text_content: string;
          text_hash: string;
          updated_at: string | null;
          voice_gender: string;
        };
        Insert: {
          audio_url?: string | null;
          audio_url_normal?: string | null;
          audio_url_slow?: string | null;
          audio_url_very_slow?: string | null;
          created_at?: string | null;
          id?: string;
          language_code: string;
          text_content: string;
          text_hash: string;
          updated_at?: string | null;
          voice_gender: string;
        };
        Update: {
          audio_url?: string | null;
          audio_url_normal?: string | null;
          audio_url_slow?: string | null;
          audio_url_very_slow?: string | null;
          created_at?: string | null;
          id?: string;
          language_code?: string;
          text_content?: string;
          text_hash?: string;
          updated_at?: string | null;
          voice_gender?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_uuid_from_numeric_id: {
        Args: { ref_type: string; num_id: number };
        Returns: string;
      };
    };
    Enums: {
      sender_type: 'user' | 'agent';
      user_gender: 'male' | 'female';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
      Database['public']['Views'])
  ? (Database['public']['Tables'] &
      Database['public']['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database['public']['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
    ? Database['public']['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof Database['public']['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Database['public']['CompositeTypes']
    ? Database['public']['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
