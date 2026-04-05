-- Add unique constraint on (project_id, employee_id) so upserts work correctly
ALTER TABLE public.allocations
  ADD CONSTRAINT allocations_project_employee_unique UNIQUE (project_id, employee_id);
