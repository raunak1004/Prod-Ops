import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Employee {
  id: string;
  profile_id?: string;
  employee_id?: string;
  employee_name?: string;
  department: string;
  position: string;
  salary?: number;
  hire_date?: string;
  status: string;
  skills?: string[];
  utilization_rate: number;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          profile:profiles!profile_id(
            full_name,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Error fetching employee data:', err);
      setError('Unable to load employee information. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (employeeId: string, updates: Partial<Employee>) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', employeeId);

      if (error) throw error;
      
      // Update local state
      setEmployees(prev => 
        prev.map(employee => 
          employee.id === employeeId ? { ...employee, ...updates } : employee
        )
      );
    } catch (err) {
      console.error('Error updating employee:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees,
    updateEmployee
  };
};