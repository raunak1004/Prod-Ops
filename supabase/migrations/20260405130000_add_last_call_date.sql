ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS last_call_date date;
