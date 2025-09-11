CREATE TABLE public.allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  allocation INTEGER NOT NULL CHECK (allocation >= 0 AND allocation <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (project_id, employee_id)
); 