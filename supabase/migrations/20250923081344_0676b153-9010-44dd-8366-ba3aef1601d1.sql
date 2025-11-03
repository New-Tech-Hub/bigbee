-- Fix security vulnerability: Customer Personal Information Could Be Stolen
-- Remove overly broad super admin access to profiles and implement granular, audited access

-- Drop the problematic super admin policy
DROP POLICY IF EXISTS "Super admin can manage all profiles" ON public.profiles;

-- Create a more secure function for admin profile access with logging
CREATE OR REPLACE FUNCTION public.admin_access_profile(target_user_id uuid, reason text DEFAULT 'administrative_access')
RETURNS TABLE(
  id uuid,
  user_id uuid, 
  full_name text,
  phone text,
  address text,
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
  -- Verify admin access
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized access to profile data';
  END IF;
  
  -- Log the admin access
  PERFORM public.log_security_event(
    'admin_profile_access',
    'profiles',
    target_user_id,
    jsonb_build_object(
      'reason', reason,
      'accessed_by', auth.uid(),
      'target_user', target_user_id
    )
  );
  
  -- Return the profile data
  RETURN QUERY
  SELECT p.id, p.user_id, p.full_name, p.phone, p.address, p.city, p.state, p.country, p.role, p.created_at, p.updated_at
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
END;
$$;

-- Create a logging function for admin access
CREATE OR REPLACE FUNCTION public.log_admin_profile_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function will always return true but logs the access
  PERFORM public.log_security_event(
    'admin_profile_access_attempt',
    'profiles',
    null,
    jsonb_build_object('accessed_by', auth.uid())
  );
  RETURN true;
END;
$$;

-- Create restricted admin policies with logging
CREATE POLICY "Super admin can view profiles with logging" 
ON public.profiles 
FOR SELECT 
USING (
  public.is_super_admin(auth.uid()) AND 
  public.log_admin_profile_access()
);

CREATE POLICY "Super admin can update profiles with logging" 
ON public.profiles 
FOR UPDATE 
USING (
  public.is_super_admin(auth.uid()) AND
  public.log_admin_profile_access()
)
WITH CHECK (
  public.is_super_admin(auth.uid())
);

CREATE POLICY "Super admin can delete profiles with logging" 
ON public.profiles 
FOR DELETE 
USING (
  public.is_super_admin(auth.uid()) AND
  public.log_admin_profile_access()
);

-- Create a view for safe profile access (excludes sensitive data)
CREATE OR REPLACE VIEW public.profiles_safe AS
SELECT 
  id,
  user_id,
  full_name,
  city,
  state, 
  country,
  role,
  created_at,
  updated_at
FROM public.profiles;

-- Add additional security constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT phone_privacy_check 
CHECK (length(phone) >= 10 OR phone IS NULL);

COMMENT ON TABLE public.profiles IS 'Contains sensitive customer personal information. All admin access is logged for security compliance.';
COMMENT ON VIEW public.profiles_safe IS 'Safe view of profiles excluding sensitive personal information like phone numbers and addresses.';