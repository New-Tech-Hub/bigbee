-- Create a function to check if user is the super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    JOIN public.profiles p ON u.id = p.user_id
    WHERE u.id = is_super_admin.user_id
    AND u.email = 'jerryguma01@gmail.com'
    AND p.role = 'admin'
  );
$$;

-- Update admin policies to use super admin check instead of regular admin
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Super admin can manage categories"
ON public.categories
FOR ALL
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Super admin can manage products"
ON public.products
FOR ALL
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage store settings" ON public.store_settings;
CREATE POLICY "Super admin can manage store settings"
ON public.store_settings
FOR ALL
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Super admin can manage all profiles"
ON public.profiles
FOR ALL
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all analytics" ON public.analytics_events;
CREATE POLICY "Super admin can view all analytics"
ON public.analytics_events
FOR SELECT
USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all order history" ON public.order_status_history;
CREATE POLICY "Super admin can manage all order history"
ON public.order_status_history
FOR ALL
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage delivery slots" ON public.delivery_slots;
CREATE POLICY "Only super admin can manage delivery slots"
ON public.delivery_slots
FOR ALL
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage coupons" ON public.discount_coupons;
CREATE POLICY "Only super admin can manage coupons"
ON public.discount_coupons
FOR ALL
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Update the role escalation prevention trigger
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow role changes only if the current user is super admin or the role isn't changing
  IF OLD.role != NEW.role AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only the super administrator can change user roles';
  END IF;
  
  RETURN NEW;
END;
$$;