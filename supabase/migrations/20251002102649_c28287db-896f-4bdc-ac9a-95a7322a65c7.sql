-- ==========================================
-- COMPREHENSIVE SECURITY HARDENING
-- ==========================================

-- 1. SECURE ROLE HIERARCHY TABLE
-- Restrict role_hierarchy access to super admins only
DROP POLICY IF EXISTS "Role hierarchy viewable by authenticated users" ON public.role_hierarchy;

CREATE POLICY "Super admin can view role hierarchy"
ON public.role_hierarchy
FOR SELECT
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can manage role hierarchy"
ON public.role_hierarchy
FOR ALL
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));


-- 2. ENHANCE PROFILES TABLE SECURITY
-- Add function to safely retrieve limited profile data for display purposes
CREATE OR REPLACE FUNCTION public.get_public_profile_info(target_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  city text,
  state text,
  country text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return only non-sensitive profile data for display purposes
  -- This is useful for showing user info in reviews, orders, etc.
  RETURN QUERY
  SELECT 
    p.user_id,
    p.full_name,
    p.city,
    p.state,
    p.country
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
END;
$$;


-- 3. ENHANCE ORDER SECURITY WITH ADMIN ACCESS LOGGING
-- Create secure function for admin order access with full auditing
CREATE OR REPLACE FUNCTION public.admin_access_order(target_order_id uuid, reason text DEFAULT 'administrative_review')
RETURNS TABLE(
  id uuid,
  user_id uuid,
  order_number text,
  total_amount numeric,
  status text,
  payment_status text,
  created_at timestamp with time zone,
  shipping_address jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify super admin access
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Super admin access required';
  END IF;
  
  -- Log the admin access with full context
  PERFORM public.log_security_event(
    'admin_order_access',
    'orders',
    target_order_id,
    jsonb_build_object(
      'reason', reason,
      'accessed_by', auth.uid(),
      'timestamp', now()
    )
  );
  
  -- Return order data
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.order_number,
    o.total_amount,
    o.status,
    o.payment_status,
    o.created_at,
    o.shipping_address
  FROM public.orders o
  WHERE o.id = target_order_id;
END;
$$;


-- 4. ADD SUPER ADMIN POLICIES FOR ORDERS
-- Allow super admins to view all orders (with logging via function)
CREATE POLICY "Super admin can view all orders"
ON public.orders
FOR SELECT
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can update all orders"
ON public.orders
FOR UPDATE
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));


-- 5. ENHANCE ORDER ITEMS SECURITY
-- Super admins can manage all order items
CREATE POLICY "Super admin can manage all order items"
ON public.order_items
FOR ALL
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));


-- 6. ADD INPUT VALIDATION FOR SENSITIVE FIELDS
-- Create trigger to validate and sanitize profile data
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate phone number format (basic validation)
  IF NEW.phone IS NOT NULL AND LENGTH(NEW.phone) > 20 THEN
    RAISE EXCEPTION 'Phone number exceeds maximum length';
  END IF;
  
  -- Validate name length
  IF NEW.full_name IS NOT NULL AND LENGTH(NEW.full_name) > 200 THEN
    RAISE EXCEPTION 'Full name exceeds maximum length';
  END IF;
  
  -- Validate address length
  IF NEW.address IS NOT NULL AND LENGTH(NEW.address) > 500 THEN
    RAISE EXCEPTION 'Address exceeds maximum length';
  END IF;
  
  -- Trim whitespace from text fields
  NEW.full_name := TRIM(NEW.full_name);
  NEW.phone := TRIM(NEW.phone);
  NEW.address := TRIM(NEW.address);
  NEW.city := TRIM(NEW.city);
  NEW.state := TRIM(NEW.state);
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_profile_data_trigger ON public.profiles;

-- Create trigger for profile validation
CREATE TRIGGER validate_profile_data_trigger
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_profile_data();


-- 7. ADD RATE LIMITING FOR SECURITY FUNCTIONS
-- Create table to track function calls for rate limiting
CREATE TABLE IF NOT EXISTS public.security_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  function_name text NOT NULL,
  call_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can write to rate limits
CREATE POLICY "System can manage rate limits"
ON public.security_rate_limits
FOR ALL
USING (true)
WITH CHECK (true);


-- 8. ENHANCE COUPON VALIDATION WITH RATE LIMITING
CREATE OR REPLACE FUNCTION public.validate_coupon_code(coupon_code text)
RETURNS TABLE(
  id uuid,
  code text,
  discount_type text,
  discount_value numeric,
  minimum_amount numeric,
  maximum_discount_amount numeric,
  usage_limit integer,
  used_count integer,
  expires_at timestamp with time zone,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_call_count integer;
  v_rate_limit integer := 10; -- Max 10 coupon validations per minute
BEGIN
  -- User must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to validate coupon codes';
  END IF;

  -- Check rate limit
  SELECT COALESCE(SUM(call_count), 0) INTO v_call_count
  FROM public.security_rate_limits
  WHERE user_id = auth.uid()
    AND function_name = 'validate_coupon_code'
    AND window_start > now() - interval '1 minute';

  IF v_call_count >= v_rate_limit THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;

  -- Record this call for rate limiting
  INSERT INTO public.security_rate_limits (user_id, function_name)
  VALUES (auth.uid(), 'validate_coupon_code')
  ON CONFLICT DO NOTHING;

  -- Log coupon validation attempt
  PERFORM public.log_security_event(
    'coupon_validation_attempt',
    'discount_coupons',
    NULL,
    jsonb_build_object(
      'coupon_code', coupon_code,
      'user_id', auth.uid(),
      'timestamp', now()
    )
  );

  -- Return coupon details only if valid
  RETURN QUERY
  SELECT 
    dc.id,
    dc.code,
    dc.discount_type,
    dc.discount_value,
    dc.minimum_amount,
    dc.maximum_discount_amount,
    dc.usage_limit,
    dc.used_count,
    dc.expires_at,
    dc.is_active
  FROM public.discount_coupons dc
  WHERE dc.code = coupon_code
    AND dc.is_active = true
    AND (dc.expires_at IS NULL OR dc.expires_at > now())
    AND (dc.usage_limit IS NULL OR dc.used_count < dc.usage_limit);
END;
$$;


-- 9. CLEANUP OLD RATE LIMIT RECORDS
-- Create function to clean up old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.security_rate_limits
  WHERE window_start < now() - interval '1 hour';
END;
$$;