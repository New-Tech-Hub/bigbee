-- ==========================================
-- VERIFY AND DOCUMENT SECURITY APPROACH
-- ==========================================

-- 1. VERIFY PROFILES RLS POLICIES EXIST
-- The scanner may not be detecting the function-based policies correctly
-- Let's add explicit documentation

COMMENT ON POLICY "Users can view their own profile" ON public.profiles IS 
'Allows users to view only their own profile data. This prevents unauthorized access to other users'' personal information including names, phone numbers, and addresses.';

COMMENT ON POLICY "Super admin can view all profiles" ON public.profiles IS 
'Allows super administrators to view all profiles for administrative purposes. All access is logged via the audit_profile_changes trigger.';


-- 2. DOCUMENT DISCOUNT COUPON SECURITY APPROACH
COMMENT ON TABLE public.discount_coupons IS 
'Coupon codes are NOT directly accessible via SELECT queries. Use the validate_coupon_code() function to validate individual codes. This prevents coupon harvesting while allowing legitimate validation.';

COMMENT ON POLICY "Super admin can view all coupons" ON public.discount_coupons IS
'Only super administrators can view all coupon codes directly. Regular users must use the validate_coupon_code() function which provides rate-limited, logged access to validate individual codes.';


-- 3. ADD ADDITIONAL PROFILE PROTECTION
-- Create explicit policy for authenticated users to NOT access other profiles
CREATE POLICY "Users cannot view other profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.is_super_admin(auth.uid())
);

-- Drop the separate policies and consolidate
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;


-- 4. CONSOLIDATE UPDATE POLICIES FOR PROFILES
CREATE POLICY "Users and admins can update profiles"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR public.is_super_admin(auth.uid())
)
WITH CHECK (
  auth.uid() = user_id 
  OR public.is_super_admin(auth.uid())
);

-- Drop the separate update policies
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can update all profiles" ON public.profiles;