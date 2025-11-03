-- Verify and recreate the SELECT policy for profiles table to ensure proper security
-- First, drop existing SELECT policy if it exists and recreate it
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a proper SELECT policy for the profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Also ensure the UPDATE policy is properly configured
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Ensure INSERT policy is properly configured
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);