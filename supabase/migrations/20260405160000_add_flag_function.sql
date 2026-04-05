-- Function to toggle deliverable flagged state, bypasses PostgREST schema cache
CREATE OR REPLACE FUNCTION public.set_deliverable_flagged(p_id uuid, p_flagged boolean)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.deliverables SET flagged = p_flagged WHERE id = p_id;
$$;
