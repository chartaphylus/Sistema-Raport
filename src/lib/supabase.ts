import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_project_url' || supabaseAnonKey === 'your_supabase_anon_key') {
  console.warn('Supabase environment variables not configured. Please set up your Supabase project credentials in the .env file.');
  // Create a mock client to prevent errors during development
  supabase = {
    from: () => ({
      select: () => ({ 
        data: [], 
        error: null,
        order: () => ({ data: [], error: null })
      }),
      insert: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      delete: () => ({ data: null, error: { message: 'Supabase not configured' } }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null })
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

export type Database = {
  public: {
    Tables: {
      raport: {
        Row: {
          id: string;
          nama: string;
          file_pdf: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          file_pdf: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          file_pdf?: string;
          created_at?: string;
        };
      };
      tunggakan: {
        Row: {
          id: string;
          nama: string;
          jumlah_tunggakan: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          jumlah_tunggakan: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          jumlah_tunggakan?: number;
          created_at?: string;
        };
      };
    };
  };
};