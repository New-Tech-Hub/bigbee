-- Drop the insecure profiles_public view
-- This view exposes customer personal information without RLS protection
-- The main 'profiles' table already has proper RLS policies and should be used instead
DROP VIEW IF EXISTS public.profiles_public CASCADE;

-- Add a comment to document why this was removed
-- If public profile data is needed in the future, use the main profiles table
-- with appropriate RLS policies or create a security definer function