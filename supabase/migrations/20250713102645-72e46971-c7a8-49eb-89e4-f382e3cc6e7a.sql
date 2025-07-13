-- Add assignee_name field to deliverables table to store assignee names as text
ALTER TABLE public.deliverables
ADD COLUMN assignee_name TEXT;