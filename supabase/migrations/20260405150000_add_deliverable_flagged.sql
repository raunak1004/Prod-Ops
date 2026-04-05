ALTER TABLE public.deliverables ADD COLUMN IF NOT EXISTS flagged boolean NOT NULL DEFAULT false;
