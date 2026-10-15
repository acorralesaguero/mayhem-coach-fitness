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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      checkins: {
        Row: {
          available_minutes: number | null
          checkin_date: string
          created_at: string
          day_outlook: string | null
          energy: number
          id: string
          motivation: number
          notes: string | null
          sleep_hours: number
          sleep_quality: number
          soreness: number
          stress: number
          user_id: string
        }
        Insert: {
          available_minutes?: number | null
          checkin_date?: string
          created_at?: string
          day_outlook?: string | null
          energy: number
          id?: string
          motivation: number
          notes?: string | null
          sleep_hours: number
          sleep_quality: number
          soreness: number
          stress: number
          user_id: string
        }
        Update: {
          available_minutes?: number | null
          checkin_date?: string
          created_at?: string
          day_outlook?: string | null
          energy?: number
          id?: string
          motivation?: number
          notes?: string | null
          sleep_hours?: number
          sleep_quality?: number
          soreness?: number
          stress?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          back_squat: number | null
          bodyweight: number | null
          build_focus: string[]
          clean_jerk: number | null
          created_at: string
          current_body_type: string | null
          deadlift: number | null
          default_duration: number
          display_name: string | null
          equipment: string[]
          experience: string | null
          front_squat: number | null
          id: string
          limitations: string | null
          max_pullups: number | null
          max_pushups: number | null
          onboarded: boolean
          primary_goal: string | null
          progression_style: string | null
          push_press: number | null
          snatch: number | null
          strict_press: number | null
          target_physique: string | null
          units: string
          updated_at: string
        }
        Insert: {
          back_squat?: number | null
          bodyweight?: number | null
          build_focus?: string[]
          clean_jerk?: number | null
          created_at?: string
          current_body_type?: string | null
          deadlift?: number | null
          default_duration?: number
          display_name?: string | null
          equipment?: string[]
          experience?: string | null
          front_squat?: number | null
          id: string
          limitations?: string | null
          max_pullups?: number | null
          max_pushups?: number | null
          onboarded?: boolean
          primary_goal?: string | null
          progression_style?: string | null
          push_press?: number | null
          snatch?: number | null
          strict_press?: number | null
          target_physique?: string | null
          units?: string
          updated_at?: string
        }
        Update: {
          back_squat?: number | null
          bodyweight?: number | null
          build_focus?: string[]
          clean_jerk?: number | null
          created_at?: string
          current_body_type?: string | null
          deadlift?: number | null
          default_duration?: number
          display_name?: string | null
          equipment?: string[]
          experience?: string | null
          front_squat?: number | null
          id?: string
          limitations?: string | null
          max_pullups?: number | null
          max_pushups?: number | null
          onboarded?: boolean
          primary_goal?: string | null
          progression_style?: string | null
          push_press?: number | null
          snatch?: number | null
          strict_press?: number | null
          target_physique?: string | null
          units?: string
          updated_at?: string
        }
        Relationships: []
      }
      week_plan: {
        Row: {
          day_of_week: number
          duration: number
          id: string
          is_training: boolean
          muscle_groups: string[]
          user_id: string
        }
        Insert: {
          day_of_week: number
          duration?: number
          id?: string
          is_training?: boolean
          muscle_groups?: string[]
          user_id: string
        }
        Update: {
          day_of_week?: number
          duration?: number
          id?: string
          is_training?: boolean
          muscle_groups?: string[]
          user_id?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          checkin_id: string | null
          completed: boolean
          created_at: string
          duration: number
          feedback: string | null
          id: string
          muscle_groups: string[]
          plan: Json
          rpe: number | null
          title: string
          user_id: string
          workout_date: string
        }
        Insert: {
          checkin_id?: string | null
          completed?: boolean
          created_at?: string
          duration: number
          feedback?: string | null
          id?: string
          muscle_groups?: string[]
          plan: Json
          rpe?: number | null
          title: string
          user_id: string
          workout_date?: string
        }
        Update: {
          checkin_id?: string | null
          completed?: boolean
          created_at?: string
          duration?: number
          feedback?: string | null
          id?: string
          muscle_groups?: string[]
          plan?: Json
          rpe?: number | null
          title?: string
          user_id?: string
          workout_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_checkin_id_fkey"
            columns: ["checkin_id"]
            isOneToOne: false
            referencedRelation: "checkins"
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
    Enums: {},
  },
} as const
