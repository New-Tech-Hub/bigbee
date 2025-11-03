-- Fix critical security leakages in the database

-- 1. Block anonymous access to active_sessions (session token theft prevention)
DROP POLICY IF EXISTS "Block anonymous session access" ON public.active_sessions;
CREATE POLICY "Block anonymous session access"
ON public.active_sessions
FOR SELECT
TO anon
USING (false);

-- 2. Restrict discount_coupons to super admin only (prevent coupon code theft)
DROP POLICY IF EXISTS "Block non-admin coupon access" ON public.discount_coupons;
CREATE POLICY "Block non-admin coupon access"
ON public.discount_coupons
FOR SELECT
TO authenticated
USING (is_super_admin(auth.uid()));

-- 3. Restrict failed_login_attempts to super admin only (prevent email enumeration)
DROP POLICY IF EXISTS "Block non-admin login attempt access" ON public.failed_login_attempts;
CREATE POLICY "Block non-admin login attempt access"
ON public.failed_login_attempts
FOR SELECT
TO authenticated
USING (is_super_admin(auth.uid()));

-- 4. Explicitly block non-admin access to security_audit_log
DROP POLICY IF EXISTS "Block non-admin audit access" ON public.security_audit_log;
CREATE POLICY "Block non-admin audit access"
ON public.security_audit_log
FOR SELECT
TO authenticated
USING (is_super_admin(auth.uid()));

-- 5. Restrict analytics_events to super admin only
DROP POLICY IF EXISTS "Block non-admin analytics access" ON public.analytics_events;
CREATE POLICY "Block non-admin analytics access"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (is_super_admin(auth.uid()));

-- 6. Explicitly block non-admin access to store_settings
DROP POLICY IF EXISTS "Block non-admin settings access" ON public.store_settings;
CREATE POLICY "Block non-admin settings access"
ON public.store_settings
FOR SELECT
TO authenticated
USING (is_super_admin(auth.uid()));

-- 7. Restrict role_hierarchy to super admin only
DROP POLICY IF EXISTS "Block non-admin role hierarchy access" ON public.role_hierarchy;
CREATE POLICY "Block non-admin role hierarchy access"
ON public.role_hierarchy
FOR SELECT
TO authenticated
USING (is_super_admin(auth.uid()));

-- 8. Explicitly block non-admin access to user_roles
DROP POLICY IF EXISTS "Block non-admin user roles access" ON public.user_roles;
CREATE POLICY "Block non-admin user roles access"
ON public.user_roles
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR is_super_admin(auth.uid()));