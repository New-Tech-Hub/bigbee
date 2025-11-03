-- ==========================================
-- FINAL SECURITY HARDENING - DELIVERY SLOTS
-- ==========================================

-- Restrict delivery slots to authenticated users only
DROP POLICY IF EXISTS "Delivery slots are viewable by everyone" ON public.delivery_slots;

CREATE POLICY "Authenticated users can view delivery slots"
ON public.delivery_slots
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_available = true);

-- Add comment explaining coupon security approach
COMMENT ON FUNCTION public.validate_coupon_code IS 
'Secure coupon validation function. Coupons are NOT directly accessible via SELECT queries. 
This function provides rate-limited, logged access to validate individual coupon codes without 
exposing the full coupon database. This prevents coupon harvesting attacks.';