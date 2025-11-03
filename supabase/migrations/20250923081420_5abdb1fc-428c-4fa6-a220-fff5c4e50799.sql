-- Fix Security Definer View issue
-- Remove the problematic view and create a more secure approach

-- Drop the view that's causing the security definer issue  
DROP VIEW IF EXISTS public.profiles_safe;

-- Instead of a view, we'll use a function that properly handles security
CREATE OR REPLACE FUNCTION public.get_safe_profile_data(target_user_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  full_name text,
  city text,
  state text, 
  country text,
  role text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If no target_user_id provided, return current user's data
  IF target_user_id IS NULL THEN
    target_user_id := auth.uid();
  END IF;

  -- Check if user can access this profile data
  IF NOT (auth.uid() = target_user_id OR public.is_super_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied to profile data';
  END IF;

  -- Log admin access if it's not the user's own data
  IF auth.uid() != target_user_id AND public.is_super_admin(auth.uid()) THEN
    PERFORM public.log_security_event(
      'admin_safe_profile_access',
      'profiles',
      target_user_id,
      jsonb_build_object('accessed_by', auth.uid())
    );
  END IF;

  -- Return the safe profile data (excluding sensitive info)
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.city,
    p.state, 
    p.country,
    p.role,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_safe_profile_data(uuid) TO authenticated;

COMMENT ON FUNCTION public.get_safe_profile_data IS 'Safely returns non-sensitive profile data with proper access controls and logging.';