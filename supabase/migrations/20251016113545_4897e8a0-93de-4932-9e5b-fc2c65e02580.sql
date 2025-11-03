-- Fix critical security issue: Restrict session management to service role only
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can manage sessions" ON public.active_sessions;

-- Create restrictive policy that only allows service role to manage sessions
CREATE POLICY "Service role can manage all sessions"
ON public.active_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add policy for authenticated users to insert their own sessions
CREATE POLICY "Users can create their own sessions"
ON public.active_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);