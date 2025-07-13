-- Add profile_id column to employees table to link with profiles
ALTER TABLE public.employees 
ADD COLUMN profile_id UUID REFERENCES public.profiles(id);

-- Update existing employees with some profile references
-- First let's see what profiles we have and update accordingly
UPDATE public.employees 
SET profile_id = (
  SELECT id FROM public.profiles LIMIT 1 OFFSET (random() * (SELECT COUNT(*) FROM public.profiles))::int
);