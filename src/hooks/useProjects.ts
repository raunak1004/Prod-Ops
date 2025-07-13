import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
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
  assignee?: {
    full_name: string;
    department: string;
  } | null;
  project?: {
    name: string;
  } | null;
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
  reporter?: {
    full_name: string;
  } | null;
  assignee?: {
    full_name: string;
  } | null;
  project?: {
    name: string;
  } | null;
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
  created_at: string;
  updated_at: string;
  employee?: {
    full_name: string;
    department: string;
  } | null;
  project?: {
    name: string;
  } | null;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Unable to load projects. Please check your connection and try again.');
    }
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching project tasks:', err);
      setError('Unable to load project tasks. Please check your connection.');
    }
  };

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (err) {
      console.error('Error fetching project issues:', err);
      setError('Unable to load project issues. Database connection failed.');
    }
  };

  const fetchDeliverables = async () => {
    try {
      const { data, error } = await supabase
        .from('deliverables')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeliverables(data || []);
    } catch (err) {
      console.error('Error fetching project deliverables:', err);
      setError('Unable to load project deliverables. Please try again.');
    }
  };

  const updateProjectStatus = async (projectId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId);

      if (error) throw error;
      
      // Update local state
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId ? { ...project, status } : project
        )
      );
    } catch (err) {
      console.error('Error updating project status:', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProjects(),
        fetchTasks(),
        fetchIssues(),
        fetchDeliverables()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    projects,
    tasks,
    issues,
    deliverables,
    loading,
    error,
    refetch: () => {
      fetchProjects();
      fetchTasks();
      fetchIssues();
      fetchDeliverables();
    },
    updateProjectStatus
  };
};