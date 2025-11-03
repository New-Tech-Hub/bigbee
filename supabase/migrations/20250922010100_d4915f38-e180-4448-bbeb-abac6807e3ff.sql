-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = is_admin.user_id
    AND profiles.role = 'admin'
  );
$$;

-- Drop existing policies that might allow role self-escalation
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policy that prevents users from changing their own role
CREATE POLICY "Users can update their own profile except role"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND (
    -- Allow role changes only if user is admin
    OLD.role = NEW.role 
    OR public.is_admin(auth.uid())
  )
);

-- Create policy for admins to manage all profiles
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Update analytics events policy to use the admin function
DROP POLICY IF EXISTS "Admins can view all analytics" ON public.analytics_events;
CREATE POLICY "Admins can view all analytics"
ON public.analytics_events
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Secure order status history for admins only
DROP POLICY IF EXISTS "Admins can manage all order history" ON public.order_status_history;
CREATE POLICY "Admins can manage all order history"
ON public.order_status_history
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Secure delivery slots for admin management
DROP POLICY IF EXISTS "Only admins can manage delivery slots" ON public.delivery_slots;
CREATE POLICY "Only admins can manage delivery slots"
ON public.delivery_slots
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Secure discount coupons for admin management
DROP POLICY IF EXISTS "Only admins can manage coupons" ON public.discount_coupons;
CREATE POLICY "Only admins can manage coupons"
ON public.discount_coupons
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Add RLS policies for categories management (admin only)
CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Add RLS policies for products management (admin only)
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Add RLS policies for store settings management (admin only)
CREATE POLICY "Admins can manage store settings"
ON public.store_settings
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));