-- Fix Security Definer View issue by creating a simple view
-- Views inherit RLS from underlying tables, so no need to enable RLS on the view itself

-- Drop the problematic view
DROP VIEW IF EXISTS public.profiles_public;

-- Create a simple view for public profile data
-- This will inherit RLS policies from the underlying profiles table
CREATE VIEW public.profiles_public AS
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

COMMENT ON VIEW public.profiles_public IS 'Public view of profiles excluding sensitive personal information like phone numbers and addresses. Access is controlled by RLS policies on the underlying profiles table.';