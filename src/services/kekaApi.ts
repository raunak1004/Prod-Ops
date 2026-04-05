import { supabase } from '@/integrations/supabase/client';

export interface KekaImportResult {
  success: boolean;
  inserted: number;
  updated: number;
  total: number;
  message?: string;
  error?: string;
}

/**
 * Triggers the keka-projects edge function which:
 * 1. Authenticates with Keka
 * 2. Fetches all projects
 * 3. Upserts them into the Supabase DB
 */
export async function importProjectsFromKeka(): Promise<KekaImportResult> {
  const { data, error } = await supabase.functions.invoke('keka-projects');

  if (error) throw new Error(error.message);
  if (!data.success) throw new Error(data.error ?? 'Unknown error from keka-projects function');

  return data as KekaImportResult;
}
