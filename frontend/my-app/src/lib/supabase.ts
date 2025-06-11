import { createBrowserClient } from '@supabase/ssr';
import { supabaseConfig } from './supabase-config';

// Tipos para los usuarios de Supabase
export type SupabaseUser = {
  id: string;
  email: string;
  app_metadata: {
    provider?: string;
    [key: string]: any;
  };
  user_metadata: {
    name?: string;
    [key: string]: any;
  };
  aud: string;
  created_at: string;
};

// Singleton para cliente del navegador
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

// Cliente para uso en el navegador (singleton)
export const createSupabaseBrowserClient = () => {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: supabaseConfig.auth
      }
    );
  }
  return browserClient;
};
