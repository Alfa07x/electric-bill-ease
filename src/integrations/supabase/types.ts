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
      billing_periods: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      bills: {
        Row: {
          consumption: number
          consumption_cost: number
          created_at: string
          customer_id: string
          due_date: string | null
          id: string
          is_paid: boolean
          issue_date: string
          meter_reading_id: string
          paid_amount: number
          period_id: string
          previous_balance: number
          remaining_amount: number
          subscription_fee: number
          tax_amount: number
          total_amount: number
        }
        Insert: {
          consumption: number
          consumption_cost: number
          created_at?: string
          customer_id: string
          due_date?: string | null
          id?: string
          is_paid?: boolean
          issue_date?: string
          meter_reading_id: string
          paid_amount?: number
          period_id: string
          previous_balance?: number
          remaining_amount: number
          subscription_fee: number
          tax_amount: number
          total_amount: number
        }
        Update: {
          consumption?: number
          consumption_cost?: number
          created_at?: string
          customer_id?: string
          due_date?: string | null
          id?: string
          is_paid?: boolean
          issue_date?: string
          meter_reading_id?: string
          paid_amount?: number
          period_id?: string
          previous_balance?: number
          remaining_amount?: number
          subscription_fee?: number
          tax_amount?: number
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "bills_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_meter_reading_id_fkey"
            columns: ["meter_reading_id"]
            isOneToOne: false
            referencedRelation: "meter_readings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "billing_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          account_number: string
          address: string
          contract_type: string | null
          created_at: string
          id: string
          meter_number: string
          name: string
          notes: string | null
          phone: string
        }
        Insert: {
          account_number: string
          address: string
          contract_type?: string | null
          created_at?: string
          id?: string
          meter_number: string
          name: string
          notes?: string | null
          phone: string
        }
        Update: {
          account_number?: string
          address?: string
          contract_type?: string | null
          created_at?: string
          id?: string
          meter_number?: string
          name?: string
          notes?: string | null
          phone?: string
        }
        Relationships: []
      }
      meter_readings: {
        Row: {
          consumption: number
          created_at: string
          current_reading: number
          customer_id: string
          id: string
          period_id: string
          previous_reading: number
          reading_date: string
        }
        Insert: {
          consumption: number
          created_at?: string
          current_reading: number
          customer_id: string
          id?: string
          period_id: string
          previous_reading: number
          reading_date?: string
        }
        Update: {
          consumption?: number
          created_at?: string
          current_reading?: number
          customer_id?: string
          id?: string
          period_id?: string
          previous_reading?: number
          reading_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "meter_readings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meter_readings_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "billing_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          bill_id: string
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
        }
        Insert: {
          amount: number
          bill_id: string
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method: string
        }
        Update: {
          amount?: number
          bill_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          id: string
          kilowatt_price: number
          subscription_fee: number
          tax_rate: number
          updated_at: string
        }
        Insert: {
          id: string
          kilowatt_price: number
          subscription_fee: number
          tax_rate: number
          updated_at?: string
        }
        Update: {
          id?: string
          kilowatt_price?: number
          subscription_fee?: number
          tax_rate?: number
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
