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
      costs: {
        Row: {
          amount: number
          cost_date: string
          cost_name: string
          created_at: string | null
          id: string
          notes: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          cost_date?: string
          cost_name: string
          created_at?: string | null
          id?: string
          notes?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          cost_date?: string
          cost_name?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "costs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_vehicles: {
        Row: {
          brand: string | null
          chassis_number: string | null
          color: string | null
          created_at: string | null
          customer_id: string
          engine_number: string | null
          id: string
          is_primary: boolean | null
          license_plate: string | null
          model: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          brand?: string | null
          chassis_number?: string | null
          color?: string | null
          created_at?: string | null
          customer_id: string
          engine_number?: string | null
          id?: string
          is_primary?: boolean | null
          license_plate?: string | null
          model?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          brand?: string | null
          chassis_number?: string | null
          color?: string | null
          created_at?: string | null
          customer_id?: string
          engine_number?: string | null
          id?: string
          is_primary?: boolean | null
          license_plate?: string | null
          model?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          customer_code: string
          date_of_birth: string | null
          email: string | null
          gender: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          customer_code: string
          date_of_birth?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          customer_code?: string
          date_of_birth?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string
          payment_number: string
          payment_status: string | null
          service_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method: string
          payment_number: string
          payment_status?: string | null
          service_id: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string
          payment_number?: string
          payment_status?: string | null
          service_id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      service_items: {
        Row: {
          created_at: string | null
          id: string
          item_name: string
          quantity: number | null
          service_id: string
          sparepart_id: string | null
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_name: string
          quantity?: number | null
          service_id: string
          sparepart_id?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_name?: string
          quantity?: number | null
          service_id?: string
          sparepart_id?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_items_sparepart_id_fkey"
            columns: ["sparepart_id"]
            isOneToOne: false
            referencedRelation: "spareparts"
            referencedColumns: ["id"]
          },
        ]
      }
      service_spareparts: {
        Row: {
          created_at: string | null
          id: string
          quantity: number
          service_id: string
          sparepart_id: string
          total_price: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          quantity?: number
          service_id: string
          sparepart_id: string
          total_price: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          quantity?: number
          service_id?: string
          sparepart_id?: string
          total_price?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_spareparts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_spareparts_sparepart_id_fkey"
            columns: ["sparepart_id"]
            isOneToOne: false
            referencedRelation: "spareparts"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          actual_cost: number | null
          complaint: string | null
          created_at: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          estimated_cost: number | null
          id: string
          license_plate: string | null
          payment_date: string | null
          payment_status: string | null
          progress: number | null
          service_fee: number | null
          service_number: string
          spareparts_total: number | null
          status: string | null
          technician: string | null
          tenant_id: string
          updated_at: string | null
          vehicle_brand: string | null
          vehicle_km: number | null
          vehicle_model: string | null
          vehicle_year: number | null
        }
        Insert: {
          actual_cost?: number | null
          complaint?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          estimated_cost?: number | null
          id?: string
          license_plate?: string | null
          payment_date?: string | null
          payment_status?: string | null
          progress?: number | null
          service_fee?: number | null
          service_number: string
          spareparts_total?: number | null
          status?: string | null
          technician?: string | null
          tenant_id: string
          updated_at?: string | null
          vehicle_brand?: string | null
          vehicle_km?: number | null
          vehicle_model?: string | null
          vehicle_year?: number | null
        }
        Update: {
          actual_cost?: number | null
          complaint?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          estimated_cost?: number | null
          id?: string
          license_plate?: string | null
          payment_date?: string | null
          payment_status?: string | null
          progress?: number | null
          service_fee?: number | null
          service_number?: string
          spareparts_total?: number | null
          status?: string | null
          technician?: string | null
          tenant_id?: string
          updated_at?: string | null
          vehicle_brand?: string | null
          vehicle_km?: number | null
          vehicle_model?: string | null
          vehicle_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "services_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      spareparts: {
        Row: {
          brand: string | null
          category: string | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          minimum_stock: number | null
          name: string
          price: number | null
          purchase_price: number | null
          selling_price: number | null
          stock: number | null
          supplier: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          minimum_stock?: number | null
          name: string
          price?: number | null
          purchase_price?: number | null
          selling_price?: number | null
          stock?: number | null
          supplier?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          minimum_stock?: number | null
          name?: string
          price?: number | null
          purchase_price?: number | null
          selling_price?: number | null
          stock?: number | null
          supplier?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spareparts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          auto_backup: boolean | null
          business_hours_close: string | null
          business_hours_open: string | null
          created_at: string | null
          description: string | null
          email: string
          email_notifications: boolean | null
          id: string
          invoice_template: string | null
          logo_url: string | null
          name: string
          owner_name: string
          package: string | null
          phone: string | null
          service_tax_rate: number | null
          sms_notifications: boolean | null
          social_media: string | null
          status: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          auto_backup?: boolean | null
          business_hours_close?: string | null
          business_hours_open?: string | null
          created_at?: string | null
          description?: string | null
          email: string
          email_notifications?: boolean | null
          id?: string
          invoice_template?: string | null
          logo_url?: string | null
          name: string
          owner_name: string
          package?: string | null
          phone?: string | null
          service_tax_rate?: number | null
          sms_notifications?: boolean | null
          social_media?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          auto_backup?: boolean | null
          business_hours_close?: string | null
          business_hours_open?: string | null
          created_at?: string | null
          description?: string | null
          email?: string
          email_notifications?: boolean | null
          id?: string
          invoice_template?: string | null
          logo_url?: string | null
          name?: string
          owner_name?: string
          package?: string | null
          phone?: string | null
          service_tax_rate?: number | null
          sms_notifications?: boolean | null
          social_media?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          image: string | null
          name: string | null
          token_identifier: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          image?: string | null
          name?: string | null
          token_identifier: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          image?: string | null
          name?: string | null
          token_identifier?: string
          updated_at?: string | null
          user_id?: string | null
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
