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
  assignee_name?: string; // Add the new field
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
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch manager details for each project
      const projectsWithManagers = await Promise.all(
        (projectsData || []).map(async (project) => {
          if (project.manager_id) {
            const { data: managerData, error: managerError } = await supabase
              .from('employees')
              .select('full_name, department')
              .eq('id', project.manager_id)
              .single();
            
            if (!managerError && managerData) {
              return { ...project, manager: managerData };
            }
          }
          return { ...project, manager: null };
        })
      );

      setProjects(projectsWithManagers);
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

  const updateProjectStatus = async (projectId: string, status: string, statusType: 'status' | 'pm_status' | 'ops_status' = 'status') => {
    try {
      const updateData = { [statusType]: status };
      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId);

      if (error) throw error;
      
      // Update local state immediately to prevent flickering
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId ? { ...project, [statusType]: status } : project
        )
      );
    } catch (err) {
      console.error('Error updating project status:', err);
      throw err;
    }
  };

  // Add a new project/product
  const addProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'manager'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select('*')
        .single();
      if (error) throw error;
      setProjects(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding project:', err);
      throw err;
    }
  };

  // Edit (update) an existing project/product
  const editProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select('*')
        .single();
      if (error) throw error;
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
      return data;
    } catch (err) {
      console.error('Error editing project:', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      try {
        // Load all data in parallel, but handle each fetch independently
        const results = await Promise.allSettled([
          fetchProjects(),
          fetchTasks(),
          fetchIssues(),
          fetchDeliverables()
        ]);
        
        // Check if any failed and set appropriate error message
        const failedFetches = results.filter(result => result.status === 'rejected');
        if (failedFetches.length > 0) {
          const firstError = failedFetches[0];
          if (firstError.status === 'rejected' && firstError.reason instanceof Error) {
            setError(firstError.reason.message);
          } else {
            setError('Some data failed to load. Please refresh the page to try again.');
          }
        }
      } catch (err) {
        console.error('Unexpected error during data loading:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
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
    updateProjectStatus,
    addProject,
    editProject
  };
};