-- Drop the public SELECT policy on discount_coupons
DROP POLICY IF EXISTS "Coupons are viewable by everyone" ON public.discount_coupons;

-- Add policy for super admin to view all coupons (needed for admin panel)
CREATE POLICY "Super admin can view all coupons"
ON public.discount_coupons
FOR SELECT
USING (public.is_super_admin(auth.uid()));

-- Create a secure function to validate and retrieve a coupon by code
-- This function uses SECURITY DEFINER to bypass RLS and validate coupons securely
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
BEGIN
  -- User must be authenticated to validate coupons
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to validate coupon codes';
  END IF;

  -- Log coupon validation attempt for security auditing
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

  -- Return coupon details only if it's valid and active
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