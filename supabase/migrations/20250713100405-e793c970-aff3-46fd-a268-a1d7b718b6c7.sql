-- First, clean up invalid foreign key references
UPDATE public.projects SET manager_id = NULL WHERE manager_id NOT IN (SELECT id FROM public.employees);
UPDATE public.tasks SET assigned_to = NULL WHERE assigned_to NOT IN (SELECT id FROM public.employees);
UPDATE public.issues SET reported_by = NULL WHERE reported_by NOT IN (SELECT id FROM public.employees);
UPDATE public.issues SET assigned_to = NULL WHERE assigned_to NOT IN (SELECT id FROM public.employees);
UPDATE public.deliverables SET responsible_employee = NULL WHERE responsible_employee NOT IN (SELECT id FROM public.employees);
UPDATE public.seats SET assigned_to = NULL WHERE assigned_to NOT IN (SELECT id FROM public.employees);

-- Now add the foreign key constraints
ALTER TABLE public.projects 
ADD CONSTRAINT projects_manager_id_fkey 
FOREIGN KEY (manager_id) REFERENCES public.employees(id);

ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES public.employees(id);

ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id);

ALTER TABLE public.issues 
ADD CONSTRAINT issues_reported_by_fkey 
FOREIGN KEY (reported_by) REFERENCES public.employees(id);

ALTER TABLE public.issues 
ADD CONSTRAINT issues_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES public.employees(id);

ALTER TABLE public.issues 
ADD CONSTRAINT issues_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id);

ALTER TABLE public.deliverables 
ADD CONSTRAINT deliverables_responsible_employee_fkey 
FOREIGN KEY (responsible_employee) REFERENCES public.employees(id);

ALTER TABLE public.deliverables 
ADD CONSTRAINT deliverables_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id);

ALTER TABLE public.seats 
ADD CONSTRAINT seats_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES public.employees(id);