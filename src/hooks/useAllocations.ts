import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Allocation {
  project_id: string;
  employee_id: string;
  allocation: number;
}

export const useAllocations = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllocations = useCallback(async () => {
    const { data, error } = await supabase.from('allocations').select('project_id, employee_id, allocation');
    if (!error && data) setAllocations(data as Allocation[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAllocations(); }, [fetchAllocations]);

  const upsert = useCallback(async (projectId: string, employeeId: string, allocation: number) => {
    const { error } = await supabase
      .from('allocations')
      .upsert({ project_id: projectId, employee_id: employeeId, allocation },
               { onConflict: 'project_id,employee_id' });
    if (!error) {
      setAllocations(prev => {
        const exists = prev.find(a => a.project_id === projectId && a.employee_id === employeeId);
        if (exists) return prev.map(a => a.project_id === projectId && a.employee_id === employeeId ? { ...a, allocation } : a);
        return [...prev, { project_id: projectId, employee_id: employeeId, allocation }];
      });
    }
    return error;
  }, []);

  const remove = useCallback(async (projectId: string, employeeId: string) => {
    const { error } = await supabase
      .from('allocations')
      .delete()
      .eq('project_id', projectId)
      .eq('employee_id', employeeId);
    if (!error) {
      setAllocations(prev => prev.filter(a => !(a.project_id === projectId && a.employee_id === employeeId)));
    }
    return error;
  }, []);

  const getProjectAllocations = useCallback(
    (projectId: string) => allocations.filter(a => a.project_id === projectId),
    [allocations]
  );

  const getEmployeeTotalAllocation = useCallback(
    (employeeId: string) => allocations.filter(a => a.employee_id === employeeId).reduce((sum, a) => sum + a.allocation, 0),
    [allocations]
  );

  return { allocations, loading, upsert, remove, getProjectAllocations, getEmployeeTotalAllocation };
};
