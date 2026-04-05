import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  pm_status: string;
  ops_status: string;
  priority: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  progress: number;
  manager_id?: string;
  created_at: string;
  updated_at: string;
  manager?: {
    full_name: string;
    department: string;
  } | null;
}

export interface Task {
  id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  assignee?: { full_name: string; department: string } | null;
  project?: { name: string } | null;
}

export interface Issue {
  id: string;
  project_id?: string;
  title: string;
  description?: string;
  severity: string;
  status: string;
  reported_by?: string;
  assigned_to?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  reporter?: { full_name: string } | null;
  assignee?: { full_name: string } | null;
  project?: { name: string } | null;
}

export interface Deliverable {
  id: string;
  project_id?: string;
  name: string;
  description?: string;
  type?: string;
  status: string;
  due_date?: string;
  completed_date?: string;
  responsible_employee?: string;
  assignee_name?: string;
  created_at: string;
  updated_at: string;
  employee?: { full_name: string; department: string } | null;
  project?: { name: string } | null;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*, manager:employees!projects_manager_id_fkey(full_name, department)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    // Supabase returns the FK join as an array; normalize to a single object
    const normalized = (data || []).map(p => ({
      ...p,
      manager: Array.isArray(p.manager) ? (p.manager[0] ?? null) : p.manager,
    }));
    setProjects(normalized as Project[]);
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setTasks(data || []);
  };

  const fetchIssues = async () => {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setIssues(data || []);
  };

  const fetchDeliverables = async () => {
    const { data, error } = await supabase
      .from('deliverables')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setDeliverables(data || []);
  };

  const refetch = async () => {
    const results = await Promise.allSettled([
      fetchProjects(),
      fetchTasks(),
      fetchIssues(),
      fetchDeliverables(),
    ]);

    const failed = results.find(r => r.status === 'rejected');
    if (failed && failed.status === 'rejected') {
      const msg = failed.reason instanceof Error ? failed.reason.message : 'Some data failed to load.';
      setError(msg);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    refetch().finally(() => setLoading(false));
  }, []);

  const updateProjectStatus = async (
    projectId: string,
    status: string,
    statusType: 'status' | 'pm_status' | 'ops_status' = 'status'
  ) => {
    const { error } = await supabase
      .from('projects')
      .update({ [statusType]: status })
      .eq('id', projectId);

    if (error) throw error;
    setProjects(prev =>
      prev.map(p => (p.id === projectId ? { ...p, [statusType]: status } : p))
    );
  };

  const addProject = async (
    projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'manager'>
  ) => {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select('*')
      .single();

    if (error) throw error;
    setProjects(prev => [data, ...prev]);
    return data;
  };

  const editProject = async (projectId: string, updates: Partial<Project>) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select('*')
      .single();

    if (error) throw error;
    setProjects(prev => prev.map(p => (p.id === projectId ? { ...p, ...updates } : p)));
    return data;
  };

  return {
    projects,
    tasks,
    issues,
    deliverables,
    loading,
    error,
    refetch,
    updateProjectStatus,
    addProject,
    editProject,
  };
};
