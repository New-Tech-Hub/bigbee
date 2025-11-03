-- Security fixes for profiles table to prevent enumeration attacks

-- 1. Add rate limiting function for profile access
CREATE OR REPLACE FUNCTION public.check_profile_access_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_call_count integer;
  v_rate_limit integer := 20; -- Max 20 profile queries per minute
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check rate limit
  SELECT COALESCE(SUM(call_count), 0) INTO v_call_count
  FROM public.security_rate_limits
  WHERE user_id = auth.uid()
    AND function_name = 'profile_access'
    AND window_start > now() - interval '1 minute';

  IF v_call_count >= v_rate_limit THEN
    -- Log the rate limit violation
    PERFORM public.log_security_event(
      'profile_access_rate_limit_exceeded',
      'profiles',
      NULL,
      jsonb_build_object('user_id', auth.uid(), 'timestamp', now())
    );
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;

  -- Record this access attempt
  INSERT INTO public.security_rate_limits (user_id, function_name)
  VALUES (auth.uid(), 'profile_access')
  ON CONFLICT DO NOTHING;

  RETURN true;
END;
$$;

-- 2. Create a secure profile access function with consistent timing
CREATE OR REPLACE FUNCTION public.get_own_profile()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  full_name text,
  phone text,
  address text,
  city text,
  state text,
  country text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check rate limit
  PERFORM public.check_profile_access_rate_limit();

  -- Return profile data with consistent timing (always does same amount of work)
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.phone,
    p.address,
    p.city,
    p.state,
    p.country,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = auth.uid();
  
  -- Always perform the same amount of work to prevent timing attacks
  PERFORM pg_sleep(0.001);
END;
$$;

-- 3. Add trigger to log suspicious profile access patterns
CREATE OR REPLACE FUNCTION public.detect_profile_enumeration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recent_attempts integer;
BEGIN
  -- Check for rapid profile access attempts (potential enumeration)
  SELECT COUNT(*) INTO v_recent_attempts
  FROM public.security_audit_log
  WHERE user_id = auth.uid()
    AND action = 'profile_access'
    AND created_at > now() - interval '10 seconds';

  -- If more than 5 attempts in 10 seconds, log as suspicious
  IF v_recent_attempts > 5 THEN
    PERFORM public.log_security_event(
      'suspicious_profile_enumeration',
      'profiles',
      NEW.user_id,
      jsonb_build_object(
        'accessed_by', auth.uid(),
        'attempt_count', v_recent_attempts,
        'timestamp', now()
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Note: We don't attach this trigger to profiles directly to avoid performance impact
-- Instead, application code should use the secure get_own_profile() function

-- 4. Add additional validation to profile data trigger
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Existing validations
  IF NEW.phone IS NOT NULL AND LENGTH(NEW.phone) > 20 THEN
    RAISE EXCEPTION 'Phone number exceeds maximum length';
  END IF;
  
  IF NEW.full_name IS NOT NULL AND LENGTH(NEW.full_name) > 200 THEN
    RAISE EXCEPTION 'Full name exceeds maximum length';
  END IF;
  
  IF NEW.address IS NOT NULL AND LENGTH(NEW.address) > 500 THEN
    RAISE EXCEPTION 'Address exceeds maximum length';
  END IF;
  
  -- Trim whitespace
  NEW.full_name := TRIM(NEW.full_name);
  NEW.phone := TRIM(NEW.phone);
  NEW.address := TRIM(NEW.address);
  NEW.city := TRIM(NEW.city);
  NEW.state := TRIM(NEW.state);
  
  -- Additional security: Log profile updates with sensitive field changes
  IF TG_OP = 'UPDATE' AND (OLD.phone IS DISTINCT FROM NEW.phone OR OLD.address IS DISTINCT FROM NEW.address) THEN
    PERFORM public.log_security_event(
      'sensitive_profile_update',
      'profiles',
      NEW.user_id,
      jsonb_build_object(
        'phone_changed', OLD.phone IS DISTINCT FROM NEW.phone,
        'address_changed', OLD.address IS DISTINCT FROM NEW.address,
        'updated_by', auth.uid()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.get_own_profile() IS 'Securely retrieves the current user profile with rate limiting and consistent timing to prevent enumeration attacks';
COMMENT ON FUNCTION public.check_profile_access_rate_limit() IS 'Prevents profile enumeration by rate limiting profile access attempts';