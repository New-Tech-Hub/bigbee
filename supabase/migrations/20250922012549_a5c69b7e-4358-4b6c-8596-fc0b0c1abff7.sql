-- Create security audit logging system
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only super admin can view audit logs
CREATE POLICY "Super admin can view audit logs"
ON public.security_audit_log
FOR SELECT
USING (public.is_super_admin(auth.uid()));

-- System can insert audit logs (for triggers)
CREATE POLICY "System can create audit logs"
ON public.security_audit_log
FOR INSERT
WITH CHECK (true);

-- Create function to log sensitive operations
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action text,
  p_table_name text DEFAULT NULL,
  p_record_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, action, table_name, record_id, details
  ) VALUES (
    auth.uid(), p_action, p_table_name, p_record_id, p_details
  );
END;
$$;

-- Create triggers for audit logging on sensitive operations
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log profile updates
  IF TG_OP = 'UPDATE' THEN
    PERFORM public.log_security_event(
      'profile_updated',
      'profiles',
      NEW.id,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'updated_by', auth.uid()
      )
    );
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger for profile changes
DROP TRIGGER IF EXISTS audit_profile_changes_trigger ON public.profiles;
CREATE TRIGGER audit_profile_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();

-- Add session management for enhanced security
CREATE OR REPLACE FUNCTION public.get_user_session_info()
RETURNS TABLE(
  user_id uuid,
  email text,
  role text,
  last_sign_in timestamp with time zone,
  session_count bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    u.email,
    p.role,
    u.last_sign_in_at,
    1::bigint as session_count
  FROM public.profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE p.user_id = auth.uid();
$$;