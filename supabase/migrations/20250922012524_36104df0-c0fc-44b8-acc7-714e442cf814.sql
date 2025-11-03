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

-- Fix Security Issue 4: Ensure order history is fully protected
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