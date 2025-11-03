-- Create performance monitoring tables

-- Performance metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  lcp NUMERIC,
  fcp NUMERIC,
  cls NUMERIC,
  tbt NUMERIC,
  speed_index NUMERIC,
  performance_score INTEGER,
  accessibility_score INTEGER,
  best_practices_score INTEGER,
  seo_score INTEGER,
  page_size BIGINT,
  load_time NUMERIC,
  requests_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance issues table
CREATE TABLE IF NOT EXISTS public.performance_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id UUID REFERENCES public.performance_metrics(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT,
  recommendation TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance alerts table
CREATE TABLE IF NOT EXISTS public.performance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id UUID REFERENCES public.performance_metrics(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;

-- Policies for performance_metrics
CREATE POLICY "Allow service role to insert metrics"
  ON public.performance_metrics
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Admins can view metrics"
  ON public.performance_metrics
  FOR SELECT
  USING (public.is_admin_or_super(auth.uid()));

-- Policies for performance_issues
CREATE POLICY "Allow service role to insert issues"
  ON public.performance_issues
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Admins can view issues"
  ON public.performance_issues
  FOR SELECT
  USING (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins can update issues"
  ON public.performance_issues
  FOR UPDATE
  USING (public.is_admin_or_super(auth.uid()));

-- Policies for performance_alerts
CREATE POLICY "Allow service role to insert alerts"
  ON public.performance_alerts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Admins can view alerts"
  ON public.performance_alerts
  FOR SELECT
  USING (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins can update alerts"
  ON public.performance_alerts
  FOR UPDATE
  USING (public.is_admin_or_super(auth.uid()));

-- Create indexes for better query performance
CREATE INDEX idx_performance_metrics_created_at ON public.performance_metrics(created_at DESC);
CREATE INDEX idx_performance_issues_metric_id ON public.performance_issues(metric_id);
CREATE INDEX idx_performance_issues_resolved ON public.performance_issues(resolved);
CREATE INDEX idx_performance_alerts_metric_id ON public.performance_alerts(metric_id);
CREATE INDEX idx_performance_alerts_resolved ON public.performance_alerts(resolved);

-- Function to clean up old metrics (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_performance_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.performance_metrics
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;