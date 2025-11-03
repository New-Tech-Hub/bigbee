/**
 * Security Monitoring Utility
 * Tracks and reports security-related events for threat detection
 */

interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: Date;
  userAgent: string;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private maxEvents = 100; // Keep last 100 events in memory

  /**
   * Log a security event
   */
  logEvent(
    type: string,
    severity: SecurityEvent['severity'],
    details: Record<string, any>
  ): void {
    const event: SecurityEvent = {
      type,
      severity,
      details,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
    };

    this.events.push(event);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Log critical events to console
    if (severity === 'critical' || severity === 'high') {
      console.warn(`🔒 Security Event [${severity.toUpperCase()}]:`, type, details);
    }

    // In production, send to backend for monitoring
    if (process.env.NODE_ENV === 'production' && severity !== 'low') {
      this.reportToBackend(event);
    }
  }

  /**
   * Report security event to backend for analysis
   */
  private async reportToBackend(event: SecurityEvent): Promise<void> {
    try {
      // This would send to your security monitoring endpoint
      // For now, we'll just log it
      console.info('Security event recorded:', event.type);
    } catch (error) {
      // Silently fail - don't break user experience
      console.error('Failed to report security event:', error);
    }
  }

  /**
   * Get recent security events
   */
  getRecentEvents(count = 10): SecurityEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Check for suspicious activity patterns
   */
  detectSuspiciousActivity(): boolean {
    const recentEvents = this.getRecentEvents(20);
    
    // Check for rapid failed authentication attempts
    const failedAuthAttempts = recentEvents.filter(
      e => e.type === 'failed_authentication' && 
           Date.now() - e.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );
    
    if (failedAuthAttempts.length >= 3) {
      this.logEvent('suspicious_activity_detected', 'high', {
        reason: 'Multiple failed authentication attempts',
        count: failedAuthAttempts.length
      });
      return true;
    }

    // Check for rapid form submissions (potential bot)
    const formSubmissions = recentEvents.filter(
      e => e.type === 'form_submission' && 
           Date.now() - e.timestamp.getTime() < 1 * 60 * 1000 // Last minute
    );
    
    if (formSubmissions.length >= 5) {
      this.logEvent('suspicious_activity_detected', 'medium', {
        reason: 'Rapid form submissions detected',
        count: formSubmissions.length
      });
      return true;
    }

    return false;
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
  }
}

// Singleton instance
export const securityMonitor = new SecurityMonitor();

/**
 * Common security event types for easy tracking
 */
export const SecurityEvents = {
  FAILED_AUTH: 'failed_authentication',
  SUSPICIOUS_INPUT: 'suspicious_input_detected',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  INVALID_TOKEN: 'invalid_token',
  XSS_ATTEMPT: 'xss_attempt_blocked',
  SQL_INJECTION_ATTEMPT: 'sql_injection_attempt',
  FILE_UPLOAD_BLOCKED: 'malicious_file_upload_blocked',
  UNAUTHORIZED_ACCESS: 'unauthorized_access_attempt',
  SESSION_HIJACK: 'session_hijacking_detected',
  DATA_EXFILTRATION: 'data_exfiltration_attempt',
} as const;

/**
 * Helper to track failed authentication attempts
 */
export const trackFailedAuth = (email: string) => {
  securityMonitor.logEvent(SecurityEvents.FAILED_AUTH, 'medium', {
    email: email.substring(0, 3) + '***', // Partial masking
    timestamp: new Date().toISOString(),
  });
};

/**
 * Helper to track suspicious input
 */
export const trackSuspiciousInput = (input: string, field: string) => {
  securityMonitor.logEvent(SecurityEvents.SUSPICIOUS_INPUT, 'high', {
    field,
    inputLength: input.length,
    pattern: input.substring(0, 50), // First 50 chars for analysis
  });
};

/**
 * Helper to track rate limit violations
 */
export const trackRateLimitExceeded = (resource: string) => {
  securityMonitor.logEvent(SecurityEvents.RATE_LIMIT_EXCEEDED, 'medium', {
    resource,
    timestamp: new Date().toISOString(),
  });
};
