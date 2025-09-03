import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          category: 'food' | 'medicine' | 'cosmetic' | 'other';
          expiry_date: string;
          status: 'active' | 'soon-expiring' | 'expired';
          image_url?: string;
          added_date: string;
          days_until_expiry: number;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: 'food' | 'medicine' | 'cosmetic' | 'other';
          expiry_date: string;
          status?: 'active' | 'soon-expiring' | 'expired';
          image_url?: string;
          added_date?: string;
          days_until_expiry?: number;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: 'food' | 'medicine' | 'cosmetic' | 'other';
          expiry_date?: string;
          status?: 'active' | 'soon-expiring' | 'expired';
          image_url?: string;
          added_date?: string;
          days_until_expiry?: number;
          user_id?: string;
        };
      };
      donations: {
        Row: {
          id: string;
          product_id: string;
          donated_by: string;
          location: string;
          contact_info: string;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          donated_by: string;
          location: string;
          contact_info: string;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          donated_by?: string;
          location?: string;
          contact_info?: string;
          is_available?: boolean;
          created_at?: string;
        };
      };
    };
  };
}