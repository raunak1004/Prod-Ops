import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Falls back to the production project when env vars are not set
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://fvmccqmrlezybbhapwau.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWNjcW1ybGV6eWJiaGFwd2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMjY2MTEsImV4cCI6MjA5MDkwMjYxMX0.Eij6xCHZZPSDroo4RfNtChry62f4egmTMH-X0DVWUPs";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});