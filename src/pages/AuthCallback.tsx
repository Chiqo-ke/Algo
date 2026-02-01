import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { logger } from "@/lib/logger";
import { API_ENDPOINTS } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const errorParam = urlParams.get('error');

        if (errorParam) {
          logger.auth.error("OAuth error received", new Error(errorParam));
          setError("Authentication failed. Please try again.");
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!code) {
          logger.auth.error("No authorization code received");
          setError("No authorization code received.");
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        logger.auth.info("Processing Google OAuth callback", { code: code.substring(0, 10) + '...' });

        // Exchange the code for tokens
        const response = await fetch(API_ENDPOINTS.auth.googleCallback, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            code,
            state,
            redirect_uri: window.location.origin + '/auth/callback'
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          logger.auth.error("Google callback failed", new Error(data.detail || 'Authentication failed'));
          throw new Error(data.detail || 'Authentication failed');
        }

        logger.auth.info("Google OAuth callback response received", { 
          hasAccess: !!data.access, 
          hasRefresh: !!data.refresh,
          hasUser: !!data.user 
        });
        
        // Store the tokens
        if (data.access && data.refresh) {
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          
          // Store user data if present
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          
          logger.auth.info("Google OAuth successful, tokens stored, redirecting to dashboard");
          
          // Force a reload to ensure auth context is updated
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 100);
        } else {
          logger.auth.error("Invalid response - missing tokens", new Error('Invalid response from server'));
          throw new Error('Invalid response from server - missing authentication tokens');
        }

      } catch (err: any) {
        logger.auth.error("OAuth callback error", err);
        console.error("Detailed OAuth error:", err);
        setError(err.message || "Authentication failed. Please try again.");
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="text-red-500 text-xl font-semibold">
              {error}
            </div>
            <p className="text-gray-400">Redirecting to login...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold text-white">
              Completing sign in...
            </h2>
            <p className="text-gray-400">Please wait while we authenticate you.</p>
          </div>
        )}
      </div>
    </div>
  );
}
