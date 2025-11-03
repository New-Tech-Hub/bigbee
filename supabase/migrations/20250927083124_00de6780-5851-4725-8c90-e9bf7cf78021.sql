-- Fix MISSING_RLS_PROTECTION for profiles_public view
-- Drop the existing insecure view
DROP VIEW IF EXISTS public.profiles_public;

-- Recreate the view as a security invoker view that respects RLS policies
CREATE VIEW public.profiles_public 
WITH (security_invoker = true)
AS 
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