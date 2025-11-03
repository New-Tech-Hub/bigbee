-- Add foreign key constraint to profiles.user_id to reference auth.users
-- This ensures profiles can only be created for valid authenticated users
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add unique constraint to prevent multiple profiles per user
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_unique 
UNIQUE (user_id);

-- Update RLS policies to be more restrictive and explicit
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;  
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create more secure RLS policies
CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Ensure no DELETE operations are allowed
-- (profiles should be deleted automatically when auth user is deleted via CASCADE)