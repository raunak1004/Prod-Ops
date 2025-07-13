-- Create weekly_status table for tracking project weekly status
CREATE TABLE public.weekly_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  week VARCHAR(10) NOT NULL,
  status TEXT NOT NULL DEFAULT 'green',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, week)
);

-- Add RLS for weekly_status
ALTER TABLE public.weekly_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on weekly_status"
ON public.weekly_status
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates on weekly_status
CREATE TRIGGER update_weekly_status_updated_at
BEFORE UPDATE ON public.weekly_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key relationship to projects
ALTER TABLE public.weekly_status
ADD CONSTRAINT weekly_status_project_id_fkey
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;