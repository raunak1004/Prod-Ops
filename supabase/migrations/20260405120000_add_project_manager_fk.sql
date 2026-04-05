ALTER TABLE public.projects
  ADD CONSTRAINT projects_manager_id_fkey
  FOREIGN KEY (manager_id) REFERENCES public.employees(id)
  ON DELETE SET NULL;
