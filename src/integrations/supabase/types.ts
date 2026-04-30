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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      dataset_meta: {
        Row: {
          id: number
          last_sync_at: string | null
          sheet_name: string | null
          source: string | null
          spreadsheet_id: string | null
          total_rows: number | null
        }
        Insert: {
          id?: number
          last_sync_at?: string | null
          sheet_name?: string | null
          source?: string | null
          spreadsheet_id?: string | null
          total_rows?: number | null
        }
        Update: {
          id?: number
          last_sync_at?: string | null
          sheet_name?: string | null
          source?: string | null
          spreadsheet_id?: string | null
          total_rows?: number | null
        }
        Relationships: []
      }
      diagnostico: {
        Row: {
          detalhamento: string | null
          id: number
          pergunta: string
          setor: string | null
          updated_at: string
        }
        Insert: {
          detalhamento?: string | null
          id?: number
          pergunta: string
          setor?: string | null
          updated_at?: string
        }
        Update: {
          detalhamento?: string | null
          id?: number
          pergunta?: string
          setor?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      funcionarios: {
        Row: {
          adicional_noturno: number | null
          alerta_qualidade: string | null
          atrasos: number | null
          cargo: string
          consumo_energia_kwh: number | null
          custo_por_resultado: number | null
          custo_total: number | null
          deslocamento_km: number | null
          emissao_co2: number | null
          faixa_desperdicio: string | null
          faltas: number | null
          funcionario: string
          horas_extras: number | null
          id: number
          impacto_sustentabilidade: number | null
          nivel_risco: string | null
          produtividade: number | null
          projetos_entregues: number | null
          salario_base: number | null
          score_desperdicio: number | null
          setor: string
          sugestao_ia: string | null
          tempo_empresa: number | null
          updated_at: string
          uso_papel: number | null
        }
        Insert: {
          adicional_noturno?: number | null
          alerta_qualidade?: string | null
          atrasos?: number | null
          cargo: string
          consumo_energia_kwh?: number | null
          custo_por_resultado?: number | null
          custo_total?: number | null
          deslocamento_km?: number | null
          emissao_co2?: number | null
          faixa_desperdicio?: string | null
          faltas?: number | null
          funcionario: string
          horas_extras?: number | null
          id?: number
          impacto_sustentabilidade?: number | null
          nivel_risco?: string | null
          produtividade?: number | null
          projetos_entregues?: number | null
          salario_base?: number | null
          score_desperdicio?: number | null
          setor: string
          sugestao_ia?: string | null
          tempo_empresa?: number | null
          updated_at?: string
          uso_papel?: number | null
        }
        Update: {
          adicional_noturno?: number | null
          alerta_qualidade?: string | null
          atrasos?: number | null
          cargo?: string
          consumo_energia_kwh?: number | null
          custo_por_resultado?: number | null
          custo_total?: number | null
          deslocamento_km?: number | null
          emissao_co2?: number | null
          faixa_desperdicio?: string | null
          faltas?: number | null
          funcionario?: string
          horas_extras?: number | null
          id?: number
          impacto_sustentabilidade?: number | null
          nivel_risco?: string | null
          produtividade?: number | null
          projetos_entregues?: number | null
          salario_base?: number | null
          score_desperdicio?: number | null
          setor?: string
          sugestao_ia?: string | null
          tempo_empresa?: number | null
          updated_at?: string
          uso_papel?: number | null
        }
        Relationships: []
      }
      padroes_criticos: {
        Row: {
          id: number
          padrao: string
          setor: string
          updated_at: string
        }
        Insert: {
          id?: number
          padrao: string
          setor: string
          updated_at?: string
        }
        Update: {
          id?: number
          padrao?: string
          setor?: string
          updated_at?: string
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
