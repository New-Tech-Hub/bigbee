/**
 * Centralized error handling utility
 * Prevents exposing sensitive error information to users
 */

/**
 * Log error only in development environment
 */
export const devLog = (message: string, error?: any) => {
  if (import.meta.env.DEV) {
    console.warn(message, error);
  }
};

/**
 * Handle Supabase errors with generic user messages
 */
export const handleSupabaseError = (error: any, context: string): string => {
  devLog(`${context} error:`, error);
  
  // Return generic error message to prevent information leakage
  return "An error occurred. Please try again later.";
};

/**
 * Check if error is due to network issues
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    error?.message?.includes('connection')
  );
};
