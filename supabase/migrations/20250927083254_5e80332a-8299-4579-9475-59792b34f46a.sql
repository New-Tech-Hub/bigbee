-- Bootstrap jerryguma01@gmail.com as super admin by temporarily disabling role escalation prevention
-- This is a one-time bootstrap operation for system setup

-- Temporarily disable the role escalation trigger
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;

-- Update jerryguma01@gmail.com to admin role
UPDATE public.profiles 
SET role = 'admin', updated_at = now()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'jerryguma01@gmail.com');

-- Re-enable the role escalation prevention trigger
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- Log the super admin bootstrap in security audit
INSERT INTO public.security_audit_log (user_id, action, details, created_at)
SELECT 
  u.id,
  'super_admin_bootstrap',
  jsonb_build_object(
    'email', u.email,
    'role_assigned', 'admin',
    'privileges', 'full_system_access',
    'can_create_admins', true,
    'bootstrap_completed', true
  ),
  now()
FROM auth.users u
WHERE u.email = 'jerryguma01@gmail.com';