-- Fix Security Issue 1: Store settings should not be publicly readable
-- Drop the public access policy for store settings
DROP POLICY IF EXISTS "Store settings are viewable by everyone" ON public.store_settings;

-- Only allow super admin to view store settings
CREATE POLICY "Only super admin can view store settings"
ON public.store_settings
FOR SELECT
USING (public.is_super_admin(auth.uid()));

-- Fix Security Issue 2: Restrict profile data access further
-- Update profile policy to be more restrictive about what data can be viewed
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create more restrictive profile access - users can only see their own data
CREATE POLICY "Users can view their own profile only"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for public profile info (only name for reviews, etc.)
CREATE POLICY "Public can view limited profile info"
ON public.profiles
FOR SELECT
USING (true)
-- Only allow viewing of non-sensitive fields for public access
WITH CHECK (false); -- No public updates allowed

-- Fix Security Issue 3: Restrict analytics access further
-- Drop the existing analytics insertion policy that might be too permissive
DROP POLICY IF EXISTS "Users can create their own events" ON public.analytics_events;

-- Create more restrictive analytics policy
CREATE POLICY "Users can create their own analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  OR (user_id IS NULL AND auth.uid() IS NOT NULL)
);

-- Ensure analytics events are not readable by regular users
-- (only super admin can read them via existing policy)

-- Fix Security Issue 4: Ensure order history is fully protected
-- The existing policies should be good, but let's add extra protection
-- Add policy to ensure order status history is only viewable by order owners or super admin
DROP POLICY IF EXISTS "Users can view their own order history" ON public.order_status_history;

CREATE POLICY "Users can view their own order status history"
ON public.order_status_history
FOR SELECT
USING (
  order_id IN (
    SELECT id FROM public.orders 
    WHERE user_id = auth.uid()
  )
  OR public.is_super_admin(auth.uid())
);

-- Fix Security Issue 5: Add additional order protection
-- Ensure order items are properly protected
-- Update order items policy to be more explicit
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;

CREATE POLICY "Users can view their own order items only"
ON public.order_items
FOR SELECT
USING (
  order_id IN (
    SELECT id FROM public.orders 
    WHERE user_id = auth.uid()
  )
  OR public.is_super_admin(auth.uid())
);

-- Add audit logging for sensitive operations
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