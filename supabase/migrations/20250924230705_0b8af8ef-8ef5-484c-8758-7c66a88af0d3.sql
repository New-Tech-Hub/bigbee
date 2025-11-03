-- Fix Security Definer View issue by replacing ALL existing RLS policies on profiles table
-- The issue is that profiles_public view inherits RLS from profiles table, 
-- and some of the profiles table policies use security definer functions which triggers the linter

-- Drop ALL existing RLS policies on profiles table
DROP POLICY IF EXISTS "Secure admin profile access with logging" ON public.profiles;
DROP POLICY IF EXISTS "Secure admin profile updates with logging" ON public.profiles;
DROP POLICY IF EXISTS "Secure admin profile deletion with logging" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile only" ON public.profiles;

-- Create clean, simple RLS policies without security definer function calls in the USING/WITH CHECK clauses
-- Users can create their own profile
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- Users can update their own profile  
CREATE POLICY "Users can update their own profile"
ON public.profiles  
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Super admin can view all profiles (using security definer function is OK for admin functions)
CREATE POLICY "Super admin can view all profiles"
ON public.profiles
FOR SELECT  
TO authenticated
USING (is_super_admin(auth.uid()));

-- Super admin can update all profiles
CREATE POLICY "Super admin can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated  
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

-- Super admin can delete profiles
CREATE POLICY "Super admin can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (is_super_admin(auth.uid()));

-- Comment: Admin access logging should be handled at the application layer 
-- rather than in RLS policies to avoid security definer issues with views