-- Fix Security Rate Limiting System Vulnerability
-- Drop the overly permissive policy that allows anyone to manipulate rate limits
DROP POLICY IF EXISTS "System can manage rate limits" ON public.security_rate_limits;

-- Create restricted policies for security_rate_limits table

-- 1. Only service role can INSERT rate limit records (for system functions)
CREATE POLICY "Service role can insert rate limits"
ON public.security_rate_limits
FOR INSERT
TO service_role
WITH CHECK (true);

-- 2. Only service role can UPDATE rate limit records
CREATE POLICY "Service role can update rate limits"
ON public.security_rate_limits
FOR UPDATE
TO service_role
USING (true);

-- 3. Only service role can DELETE old rate limit records (for cleanup)
CREATE POLICY "Service role can delete rate limits"
ON public.security_rate_limits
FOR DELETE
TO service_role
USING (true);

-- 4. Only service role can SELECT rate limit records (for security functions)
CREATE POLICY "Service role can view rate limits"
ON public.security_rate_limits
FOR SELECT
TO service_role
USING (true);

-- Add comment explaining the security model
COMMENT ON TABLE public.security_rate_limits IS 
'Rate limiting data table. Access restricted to service role only to prevent manipulation. 
All rate limit checks must go through SECURITY DEFINER functions that use service role privileges.';