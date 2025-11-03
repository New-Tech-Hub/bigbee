-- Fix Customer Personal Information Security Vulnerability
-- Strengthen profiles table RLS policies with explicit authentication requirements

-- First, verify RLS is enabled (should already be enabled, but let's be explicit)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop the existing SELECT policy to replace it with more explicit ones
DROP POLICY IF EXISTS "Users cannot view other profiles" ON public.profiles;

-- Create explicit, restrictive policies with authentication requirements

-- 1. Users can ONLY view their own profile (must be authenticated)
CREATE POLICY "Users can view only their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Super admins can view all profiles (must be authenticated and have super_admin role)
CREATE POLICY "Super admin can view all profiles with audit"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_super_admin(auth.uid()) 
  AND public.log_admin_profile_access()
);

-- 3. Explicitly deny ALL access to unauthenticated users (defense in depth)
-- This is implicit with the above policies, but we add it for clarity
CREATE POLICY "Block all unauthenticated access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Add table comment documenting the security model
COMMENT ON TABLE public.profiles IS 
'Contains sensitive customer PII (phone, address, full name). 
RLS strictly enforced: users can only access their own data, super admins can access all with audit logging.
Unauthenticated access explicitly blocked. Never disable RLS on this table.';

-- Add column comments for sensitive fields
COMMENT ON COLUMN public.profiles.phone IS 'Sensitive PII - customer phone number';
COMMENT ON COLUMN public.profiles.address IS 'Sensitive PII - customer home address';
COMMENT ON COLUMN public.profiles.full_name IS 'Sensitive PII - customer full name';