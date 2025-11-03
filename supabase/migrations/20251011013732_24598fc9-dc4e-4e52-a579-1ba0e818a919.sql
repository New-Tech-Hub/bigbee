-- Create a SECURITY DEFINER function to get customer count with admin verification
CREATE OR REPLACE FUNCTION public.get_customer_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::bigint 
  FROM public.profiles
  WHERE is_super_admin(auth.uid());
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_customer_count() TO authenticated;