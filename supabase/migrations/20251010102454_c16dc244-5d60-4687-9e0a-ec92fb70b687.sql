-- ============================================================================
-- SECURITY FIX: Make audit logs immutable to prevent evidence tampering
-- ============================================================================

-- Drop any existing DELETE/UPDATE policies to ensure clean state
DROP POLICY IF EXISTS "Audit logs are immutable - no deletes" ON public.security_audit_log;
DROP POLICY IF EXISTS "Audit logs are immutable - no updates" ON public.security_audit_log;
DROP POLICY IF EXISTS "Service role can cleanup old audit logs" ON public.security_audit_log;

-- ============================================================================
-- STEP 1: Create explicit DENY policies for authenticated users
-- ============================================================================

-- Block all DELETE operations from authenticated users (including super_admin)
CREATE POLICY "Audit logs are immutable - no deletes"
ON public.security_audit_log
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (false);

-- Block all UPDATE operations from authenticated users (including super_admin)
CREATE POLICY "Audit logs are immutable - no updates"
ON public.security_audit_log
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (false);

-- ============================================================================
-- STEP 2: Allow service_role to delete only old logs for GDPR compliance
-- ============================================================================

CREATE POLICY "Service role can cleanup old audit logs"
ON public.security_audit_log
AS PERMISSIVE
FOR DELETE
TO service_role
USING (created_at < NOW() - INTERVAL '90 days');

-- ============================================================================
-- STEP 3: Create tamper detection trigger (defense in depth)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.detect_audit_log_tampering()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This should never execute due to RLS, but acts as defense in depth
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'SECURITY VIOLATION: Attempt to modify immutable audit log detected. Log ID: %, User: %', 
      OLD.id, auth.uid();
  END IF;
  
  IF TG_OP = 'DELETE' AND OLD.created_at >= NOW() - INTERVAL '90 days' THEN
    RAISE EXCEPTION 'SECURITY VIOLATION: Attempt to delete recent audit log detected. Log ID: %, Age: % days, User: %', 
      OLD.id, EXTRACT(DAY FROM NOW() - OLD.created_at), auth.uid();
  END IF;
  
  RETURN OLD;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS prevent_audit_log_tampering ON public.security_audit_log;

-- Create trigger to prevent tampering
CREATE TRIGGER prevent_audit_log_tampering
  BEFORE UPDATE OR DELETE ON public.security_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.detect_audit_log_tampering();

-- ============================================================================
-- STEP 4: Add comprehensive security documentation
-- ============================================================================

COMMENT ON TABLE public.security_audit_log IS 
'IMMUTABLE AUDIT LOG - SECURITY CRITICAL
Contains all security events for compliance and forensic analysis.
RESTRICTIONS:
- NO updates allowed (immutable records)
- NO deletes allowed except automated cleanup of logs >90 days old by service_role
- All modification attempts trigger security violation exceptions
- Access restricted to super_admin (read-only) and service_role (cleanup only)
MONITORING: Review logs regularly for tampering attempts via detect_audit_log_tampering()';

COMMENT ON COLUMN public.security_audit_log.id IS 
'Unique identifier for audit log entry. Immutable.';

COMMENT ON COLUMN public.security_audit_log.user_id IS 
'User who triggered the security event. Can be NULL for system events.';

COMMENT ON COLUMN public.security_audit_log.action IS 
'Type of security event (e.g., admin_profile_access, role_assigned, coupon_validation_attempt)';

COMMENT ON COLUMN public.security_audit_log.details IS 
'JSONB containing event context and metadata. Never contains passwords or tokens.';

COMMENT ON COLUMN public.security_audit_log.created_at IS 
'Timestamp when security event occurred. Used for GDPR retention (90 days). Immutable.';

-- ============================================================================
-- STEP 5: Verify RLS is enabled
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'security_audit_log' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'CRITICAL: RLS is not enabled on security_audit_log table';
  END IF;
END $$;