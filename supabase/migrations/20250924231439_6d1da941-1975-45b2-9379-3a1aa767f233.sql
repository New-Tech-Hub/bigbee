-- Fix Security Definer View issue by recreating profiles_public view with security_invoker = true
-- This ensures the view respects RLS policies from the underlying profiles table

-- Drop the existing view
DROP VIEW IF EXISTS public.profiles_public;

-- Create the view with security_invoker = true to respect RLS policies
CREATE VIEW public.profiles_public
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  full_name,
  city,
  state, 
  country,
  created_at,
  updated_at
FROM public.profiles;

COMMENT ON VIEW public.profiles_public IS 'Public view of profiles excluding sensitive personal information like phone numbers and addresses. Uses security_invoker=true to respect RLS policies from the underlying profiles table.';