/**
 * Sanitize input by trimming and removing potentially harmful characters
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 255); // Limit length
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
};

/**
 * Validate name input
 */
export const validateName = (name: string): { isValid: boolean; message?: string } => {
  const sanitized = sanitizeInput(name);
  
  if (sanitized.length < 1) {
    return { isValid: false, message: 'Name is required' };
  }
  
  if (sanitized.length > 50) {
    return { isValid: false, message: 'Name must be less than 50 characters' };
  }
  
  if (!/^[a-zA-Z\s'-]+$/.test(sanitized)) {
    return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { isValid: true };
};

/**
 * Enhanced sanitization for JSON data
 */
export const sanitizeJsonInput = (input: string): string => {
  try {
    // Parse and re-stringify to ensure valid JSON and remove potential payloads
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed);
  } catch {
    return '';
  }
};

/**
 * Sanitize URL to prevent XSS and open redirects
 */
export const sanitizeUrl = (url: string): string => {
  const sanitized = url.trim();
  
  // Only allow http, https, and relative URLs
  const allowedProtocols = ['http:', 'https:', 'mailto:', '/'];
  const hasAllowedProtocol = allowedProtocols.some(protocol => 
    sanitized.startsWith(protocol) || !sanitized.includes(':')
  );
  
  if (!hasAllowedProtocol) {
    return '#'; // Return safe fallback for invalid URLs
  }
  
  // Block javascript: and data: URIs
  if (sanitized.toLowerCase().match(/^(javascript|data|vbscript|file):/)) {
    return '#';
  }
  
  return sanitized;
};

/**
 * Validate phone number format (Nigerian numbers)
 */
export const validatePhoneNumber = (phone: string): { isValid: boolean; message?: string } => {
  const sanitized = phone.trim().replace(/[\s-()]/g, '');
  
  // Nigerian phone number format: +234XXXXXXXXXX or 0XXXXXXXXXXX
  const phoneRegex = /^(\+234|0)[789]\d{9}$/;
  
  if (!phoneRegex.test(sanitized)) {
    return { 
      isValid: false, 
      message: 'Please enter a valid Nigerian phone number (e.g., +234XXXXXXXXXX or 0XXXXXXXXXX)' 
    };
  }
  
  return { isValid: true };
};

/**
 * Sanitize and validate address input
 */
export const validateAddress = (address: string): { isValid: boolean; message?: string } => {
  const sanitized = sanitizeInput(address);
  
  if (sanitized.length < 10) {
    return { isValid: false, message: 'Address must be at least 10 characters long' };
  }
  
  if (sanitized.length > 500) {
    return { isValid: false, message: 'Address must be less than 500 characters' };
  }
  
  return { isValid: true };
};

/**
 * Rate limiting helper - client-side throttle
 */
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, number[]>();
  
  return {
    checkLimit: (key: string): boolean => {
      const now = Date.now();
      const userAttempts = attempts.get(key) || [];
      
      // Filter attempts within the time window
      const recentAttempts = userAttempts.filter(time => now - time < windowMs);
      
      if (recentAttempts.length >= maxAttempts) {
        return false; // Rate limit exceeded
      }
      
      // Add new attempt
      recentAttempts.push(now);
      attempts.set(key, recentAttempts);
      
      return true; // Within rate limit
    },
    reset: (key: string) => {
      attempts.delete(key);
    }
  };
};

/**
 * Detect suspicious patterns in user input
 */
export const detectSuspiciousInput = (input: string): boolean => {
  const suspiciousPatterns = [
    /<script|<iframe|<object|<embed/i, // HTML injection
    /javascript:|data:|vbscript:/i, // Protocol injection
    /on\w+\s*=/i, // Event handler injection
    /eval\(|setTimeout\(|setInterval\(/i, // Code execution
    /\.\.\//g, // Path traversal
    /union.*select|select.*from|insert.*into|delete.*from|drop.*table/i, // SQL injection
    /\${|<%|<%=|<\?php/i, // Template/code injection
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
};

/**
 * Sanitize file name for uploads
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscore
    .replace(/\.{2,}/g, '.') // Remove multiple dots (path traversal)
    .slice(0, 255); // Limit length
};