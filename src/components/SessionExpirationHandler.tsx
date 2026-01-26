import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

/**
 * SessionExpirationHandler
 * 
 * Global component that listens for session expiration events
 * and displays user-friendly notifications before redirecting to login.
 * 
 * This should be mounted once at the app root level.
 */
export default function SessionExpirationHandler() {
  const { toast } = useToast();

  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
      const customEvent = event as CustomEvent;
      const message = customEvent.detail?.message || 'Your session has expired. Please log in again.';
      
      logger.auth.warn('Session expiration event received, showing notification', { message });
      
      // Show toast notification
      toast({
        variant: 'destructive',
        title: 'Session Expired',
        description: message,
        duration: 3000,
      });
    };

    // Listen for session expiration events from API layer
    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [toast]);

  // This component doesn't render anything
  return null;
}
