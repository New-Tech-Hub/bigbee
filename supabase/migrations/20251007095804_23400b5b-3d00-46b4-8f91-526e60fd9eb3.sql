-- Fix security audit log INSERT policy to prevent forged entries
-- Drop the unrestricted policy
DROP POLICY IF EXISTS "System can create audit logs" ON public.security_audit_log;

-- Create a restrictive policy that only allows service_role to insert
-- SECURITY DEFINER functions like log_security_event() will still work because they bypass RLS
CREATE POLICY "Only system functions can create audit logs"
ON public.security_audit_log
FOR INSERT
WITH CHECK (
  -- Only allow inserts from service role context
  -- This prevents authenticated users from forging audit entries
  (auth.jwt() ->> 'role') = 'service_role'
);