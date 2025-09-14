import { supabase } from "@/integrations/supabase/client";

interface KekaProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  progress?: number;
  department?: string;
}

class KekaApiService {
  public async fetchProjects(): Promise<KekaProject[]> {
    try {
      const { data, error } = await supabase.functions.invoke('keka-projects');
      
      if (error) {
        console.error('Failed to fetch projects from Keka:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch projects from Keka:', error);
      throw error;
    }
  }

  public isConfigured(): boolean {
    // Since we're using Supabase secrets, always return true
    return true;
  }
}

export const kekaApiService = new KekaApiService();
export type { KekaProject };