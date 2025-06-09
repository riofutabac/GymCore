// Mock Supabase config for development without external dependencies
export const supabaseConfig = {
  url: process.env.SUPABASE_URL || 'mock-url',
  key: process.env.SUPABASE_ANON_KEY || 'mock-key',
};
