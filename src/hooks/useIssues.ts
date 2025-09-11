import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Issue {
  id: string;
  project_id: string;
  title: string;
  description: string;
  severity: 'Sev1' | 'Sev2' | 'Sev3' | 'Incident';
  status: 'unresolved' | 'resolved';
  assigned_to: string;
  created_at: string;
  updated_at: string;
  eta?: string;
}

export const useIssues = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setError('Unable to load issues.');
      setIssues([]);
    } else {
      setIssues(
        (data || []).map((issue: any) => ({
          id: issue.id,
          project_id: issue.project_id,
          title: issue.title,
          description: issue.description,
          severity: (['Sev1', 'Sev2', 'Sev3', 'Incident'].includes(issue.severity) ? issue.severity : 'Sev2') as 'Sev1' | 'Sev2' | 'Sev3' | 'Incident',
          status: (issue.status === 'resolved' || issue.status === 'unresolved') ? issue.status : 'unresolved',
          assigned_to: issue.assigned_to || '',
          created_at: issue.created_at,
          updated_at: issue.updated_at,
          eta: issue.eta || undefined,
        }))
      );
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchIssues();
    // Real-time subscription
    const subscription = supabase
      .channel('public:issues')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, fetchIssues)
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchIssues]);

  const addIssue = async (issue: Omit<Issue, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase
      .from('issues')
      .insert([{ ...issue }]);
    if (error) throw error;
    await fetchIssues();
  };

  const updateIssue = async (id: string, updates: Partial<Issue>) => {
    const { error } = await supabase
      .from('issues')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    await fetchIssues();
  };

  const deleteIssue = async (id: string) => {
    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', id);
    if (error) throw error;
    await fetchIssues();
  };

  return {
    issues,
    loading,
    error,
    addIssue,
    updateIssue,
    deleteIssue,
    refetchIssues: fetchIssues,
  };
}; 