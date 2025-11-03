import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  lcp?: number;
  fcp?: number;
  cls?: number;
  tbt?: number;
  speed_index?: number;
  performance_score?: number;
  page_size?: number;
  load_time?: number;
  requests_count?: number;
}

export const usePerformanceMonitor = () => {
  useEffect(() => {
    // Only monitor in production
    if (import.meta.env.DEV) return;

    const collectMetrics = async () => {
      try {
        const metrics: PerformanceMetrics = {};
        const issues: any[] = [];

        // Collect Web Vitals using PerformanceObserver
        if ('PerformanceObserver' in window) {
          // Largest Contentful Paint (LCP)
          try {
            const lcpObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1] as any;
              metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
              
              if (metrics.lcp > 2500) {
                issues.push({
                  type: 'lcp',
                  severity: metrics.lcp > 4000 ? 'high' : 'medium',
                  description: `LCP is ${(metrics.lcp / 1000).toFixed(2)}s (should be < 2.5s)`,
                  recommendation: 'Optimize largest content element loading, consider lazy loading images'
                });
              }
            });
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
          } catch (e) {
            // LCP observation not supported in this browser
          }

          // First Contentful Paint (FCP)
          try {
            const fcpObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              entries.forEach((entry: any) => {
                if (entry.name === 'first-contentful-paint') {
                  metrics.fcp = entry.startTime;
                  
                  if (metrics.fcp > 1800) {
                    issues.push({
                      type: 'fcp',
                      severity: metrics.fcp > 3000 ? 'high' : 'medium',
                      description: `FCP is ${(metrics.fcp / 1000).toFixed(2)}s (should be < 1.8s)`,
                      recommendation: 'Reduce render-blocking resources, inline critical CSS'
                    });
                  }
                }
              });
            });
            fcpObserver.observe({ type: 'paint', buffered: true });
          } catch (e) {
            // FCP observation not supported in this browser
          }

          // Cumulative Layout Shift (CLS)
          try {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
              for (const entry of list.getEntries() as any[]) {
                if (!entry.hadRecentInput) {
                  clsValue += entry.value;
                }
              }
              metrics.cls = clsValue;
              
              if (metrics.cls > 0.1) {
                issues.push({
                  type: 'cls',
                  severity: metrics.cls > 0.25 ? 'high' : 'medium',
                  description: `CLS is ${metrics.cls.toFixed(3)} (should be < 0.1)`,
                  recommendation: 'Set explicit dimensions for images and embeds, avoid dynamically injected content'
                });
              }
            });
            clsObserver.observe({ type: 'layout-shift', buffered: true });
          } catch (e) {
            // CLS observation not supported in this browser
          }
        }

        // Collect page load metrics
        if (performance && performance.timing) {
          const timing = performance.timing;
          metrics.load_time = timing.loadEventEnd - timing.navigationStart;
          
          if (metrics.load_time > 3000) {
            issues.push({
              type: 'load_time',
              severity: metrics.load_time > 5000 ? 'high' : 'medium',
              description: `Page load time is ${(metrics.load_time / 1000).toFixed(2)}s`,
              recommendation: 'Reduce bundle size, enable compression, use CDN'
            });
          }
        }

        // Get resource metrics
        if (performance && performance.getEntriesByType) {
          const resources = performance.getEntriesByType('resource');
          metrics.requests_count = resources.length;
          metrics.page_size = resources.reduce((sum, resource: any) => 
            sum + (resource.transferSize || 0), 0
          );

          if (metrics.page_size > 3000000) { // 3MB
            issues.push({
              type: 'page_size',
              severity: metrics.page_size > 5000000 ? 'high' : 'medium',
              description: `Page size is ${(metrics.page_size / 1000000).toFixed(2)}MB`,
              recommendation: 'Compress images, minify assets, enable code splitting'
            });
          }
        }

        // Calculate a simple performance score (0-100)
        let score = 100;
        if (metrics.lcp) score -= Math.min(30, (metrics.lcp - 2500) / 100);
        if (metrics.fcp) score -= Math.min(20, (metrics.fcp - 1800) / 100);
        if (metrics.cls) score -= Math.min(20, (metrics.cls - 0.1) * 100);
        if (metrics.load_time) score -= Math.min(30, (metrics.load_time - 3000) / 100);
        metrics.performance_score = Math.max(0, Math.round(score));

        // Defer metrics sending to avoid blocking critical path
        // Use requestIdleCallback if available, otherwise defer significantly
        const sendMetrics = async () => {
          try {
            // Get the current session to include auth token
            const { data: { session } } = await supabase.auth.getSession();
            
            await supabase.functions.invoke('performance-monitor', {
              body: {
                url: window.location.href,
                metrics,
                issues: issues.length > 0 ? issues : null
              },
              headers: session?.access_token ? {
                Authorization: `Bearer ${session.access_token}`
              } : undefined
            });
          } catch (error) {
            // Silently fail - performance monitoring shouldn't break the app
            if (import.meta.env.DEV) {
              console.error('Failed to send performance metrics');
            }
          }
        };

        // Use requestIdleCallback to send during idle time, or defer by 10 seconds
        if ('requestIdleCallback' in window) {
          requestIdleCallback(sendMetrics, { timeout: 10000 });
        } else {
          setTimeout(sendMetrics, 10000);
        }

      } catch (error) {
        // Silently fail in production
        if (import.meta.env.DEV) {
          console.error('Error collecting performance metrics');
        }
      }
    };

    // Collect metrics after page is fully loaded and settled
    const initMetrics = () => {
      // Wait additional 2 seconds after load for metrics to stabilize
      setTimeout(collectMetrics, 2000);
    };

    if (document.readyState === 'complete') {
      initMetrics();
    } else {
      window.addEventListener('load', initMetrics);
      return () => window.removeEventListener('load', initMetrics);
    }
  }, []);
};
