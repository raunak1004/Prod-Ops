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
  };
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
  };
  project?: {
    name: string;
  };
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
  };
  assignee?: {
    full_name: string;
  };
  project?: {
    name: string;
  };
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
  };
  project?: {
    name: string;
  };
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
        .select(`
          *,
          manager:employees!manager_id(full_name, department)
        `)
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
        .select(`
          *,
          assignee:employees!assigned_to(
            id,
            employee_id,
            full_name,
            email,
            avatar_url,
            department
          ),
          project:projects(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to flatten the nested structure
      const transformedTasks = data?.map(task => ({
        ...task,
        assignee: task.assignee ? {
          full_name: task.assignee.full_name || 'Unknown',
          department: task.assignee.department || 'Unknown'
        } : null
      })) || [];
      
      setTasks(transformedTasks);
    } catch (err) {
      console.error('Error fetching project tasks:', err);
      setError('Unable to load project tasks. Please check your connection.');
    }
  };

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          reporter:employees!reported_by(
            id,
            employee_id,
            full_name,
            email,
            avatar_url
          ),
          assignee:employees!assigned_to(
            id,
            employee_id,
            full_name,
            email,
            avatar_url
          ),
          project:projects(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedIssues = data?.map(issue => ({
        ...issue,
        reporter: issue.reporter ? {
          full_name: issue.reporter.full_name || 'Unknown'
        } : null,
        assignee: issue.assignee ? {
          full_name: issue.assignee.full_name || 'Unknown'
        } : null
      })) || [];
      
      setIssues(transformedIssues);
    } catch (err) {
      console.error('Error fetching project issues:', err);
      setError('Unable to load project issues. Database connection failed.');
    }
  };

  const fetchDeliverables = async () => {
    try {
      const { data, error } = await supabase
        .from('deliverables')
        .select(`
          *,
          employee:employees!responsible_employee(
            id,
            employee_id,
            full_name,
            email,
            avatar_url,
            department
          ),
          project:projects(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedDeliverables = data?.map(deliverable => ({
        ...deliverable,
        employee: deliverable.employee ? {
          full_name: deliverable.employee.full_name || 'Unknown',
          department: deliverable.employee.department || 'Unknown'
        } : null
      })) || [];
      
      setDeliverables(transformedDeliverables);
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