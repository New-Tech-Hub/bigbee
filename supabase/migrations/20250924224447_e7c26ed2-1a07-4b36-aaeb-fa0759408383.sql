-- Fix security vulnerability: Customer Personal Information Could Be Stolen
-- Clean up existing policies and implement secure access with logging

-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Super admin can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can view profiles with logging" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can update profiles with logging" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can delete profiles with logging" ON public.profiles;

-- Create secure admin access function with comprehensive logging
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
  
  -- Log the admin access with full context
  PERFORM public.log_security_event(
    'admin_profile_access',
    'profiles',
    target_user_id,
    jsonb_build_object(
      'reason', reason,
      'accessed_by', auth.uid(),
      'target_user', target_user_id,
      'timestamp', now()
    )
  );
  
  -- Return the profile data
  RETURN QUERY
  SELECT p.id, p.user_id, p.full_name, p.phone, p.address, p.city, p.state, p.country, p.role, p.created_at, p.updated_at
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
END;
$$;

-- Create new secure policies with mandatory logging
CREATE POLICY "Secure admin profile access with logging" 
ON public.profiles 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (public.is_super_admin(auth.uid()) AND (
    -- Log every admin access attempt
    public.log_security_event(
      'admin_profile_view',
      'profiles', 
      user_id,
      jsonb_build_object('viewed_by', auth.uid(), 'sensitive_data_accessed', true)
    ) IS NOT NULL
  ))
);

CREATE POLICY "Secure admin profile updates with logging" 
ON public.profiles 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (public.is_super_admin(auth.uid()) AND (
    -- Log update attempts
    public.log_security_event(
      'admin_profile_update_attempt',
      'profiles',
      user_id, 
      jsonb_build_object('updated_by', auth.uid(), 'action', 'profile_modification')
    ) IS NOT NULL
  ))
)
WITH CHECK (
  (auth.uid() = user_id) OR public.is_super_admin(auth.uid())
);

CREATE POLICY "Secure admin profile deletion with logging" 
ON public.profiles 
FOR DELETE 
USING (
  public.is_super_admin(auth.uid()) AND (
    -- Log deletion attempts (highly sensitive)
    public.log_security_event(
      'admin_profile_deletion',
      'profiles',
      user_id,
      jsonb_build_object('deleted_by', auth.uid(), 'action', 'profile_deletion', 'severity', 'critical')
    ) IS NOT NULL
  )
);

-- Create a secure view for non-sensitive profile data
CREATE OR REPLACE VIEW public.profiles_public AS
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

-- Add comments for security compliance
COMMENT ON TABLE public.profiles IS 'SENSITIVE: Contains customer personal information. All admin access is logged and audited for compliance.';
COMMENT ON FUNCTION public.admin_access_profile IS 'SECURE FUNCTION: Provides audited access to customer profiles for authorized administrators only.';

-- Create index for security audit queries
CREATE INDEX IF NOT EXISTS idx_security_audit_profiles 
ON public.security_audit_log(table_name, record_id) 
WHERE table_name = 'profiles';