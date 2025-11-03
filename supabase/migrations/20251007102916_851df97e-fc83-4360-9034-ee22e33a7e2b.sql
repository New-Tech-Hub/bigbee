-- Fix Analytics Events RLS Policy
-- Drop the existing overly permissive INSERT policy
DROP POLICY IF EXISTS "Users can create their own analytics events" ON public.analytics_events;

-- Create separate policies for authenticated users and service role
CREATE POLICY "Authenticated users can insert their own analytics events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert anonymous analytics events"
ON public.analytics_events
FOR INSERT
TO service_role
WITH CHECK (user_id IS NULL);

-- Add rate limiting for analytics events to prevent abuse
CREATE OR REPLACE FUNCTION public.check_analytics_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_call_count integer;
  v_rate_limit integer := 50; -- Max 50 analytics events per minute
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN true; -- Allow anonymous events from service role
  END IF;

  -- Check rate limit for authenticated users
  SELECT COALESCE(SUM(call_count), 0) INTO v_call_count
  FROM public.security_rate_limits
  WHERE user_id = auth.uid()
    AND function_name = 'analytics_tracking'
    AND window_start > now() - interval '1 minute';

  IF v_call_count >= v_rate_limit THEN
    -- Log the rate limit violation
    PERFORM public.log_security_event(
      'analytics_rate_limit_exceeded',
      'analytics_events',
      NULL,
      jsonb_build_object('user_id', auth.uid(), 'timestamp', now())
    );
    RAISE EXCEPTION 'Rate limit exceeded for analytics tracking';
  END IF;

  -- Record this analytics call
  INSERT INTO public.security_rate_limits (user_id, function_name)
  VALUES (auth.uid(), 'analytics_tracking')
  ON CONFLICT DO NOTHING;

  RETURN true;
END;
$$;

-- Add validation trigger for analytics events
CREATE OR REPLACE FUNCTION public.validate_analytics_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check rate limit for authenticated users
  IF auth.uid() IS NOT NULL THEN
    PERFORM public.check_analytics_rate_limit();
  END IF;

  -- Validate event_data doesn't contain PII
  -- Prevent logging of sensitive information
  IF NEW.event_data IS NOT NULL THEN
    -- Check for common PII patterns
    IF NEW.event_data::text ~* '(email|password|ssn|credit_card|phone)' THEN
      RAISE EXCEPTION 'Analytics events must not contain PII';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_analytics_event_trigger ON public.analytics_events;
CREATE TRIGGER validate_analytics_event_trigger
  BEFORE INSERT ON public.analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_analytics_event();