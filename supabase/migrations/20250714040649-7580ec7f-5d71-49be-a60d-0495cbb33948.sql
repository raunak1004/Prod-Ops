-- Add separate PM and Ops status fields to projects table
ALTER TABLE public.projects 
ADD COLUMN pm_status TEXT DEFAULT 'not-started',
ADD COLUMN ops_status TEXT DEFAULT 'not-started';

-- Update existing projects to have PM and Ops status match their current status
UPDATE public.projects 
SET pm_status = status, ops_status = status 
WHERE pm_status IS NULL OR ops_status IS NULL;