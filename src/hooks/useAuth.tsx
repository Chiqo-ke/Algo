import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_ENDPOINTS, apiPost, apiGet } from "@/lib/api";
import { logger } from "@/lib/logger";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          logger.auth.info("Checking authentication with stored token");
          const { data, error } = await apiGet<User>(API_ENDPOINTS.auth.user);
          if (data && !error) {
            setUser(data);
            logger.auth.info("User authenticated successfully", { username: data.username, userId: data.id });
          } else {
            // Token is invalid or expired, clear it
            logger.auth.warn("Token invalid or expired, clearing tokens", { error });
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }
        } catch (err) {
          // Silent fail - token expired or invalid
          logger.auth.error("Auth check failed, clearing tokens", err as Error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      } else {
        logger.auth.debug("No token found, user not logged in");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    logger.auth.info("Attempting login", { username });
    const startTime = performance.now();
    
    const { data, error } = await apiPost<{
      tokens: {
        access: string;
        refresh: string;
      };
      user: User;
    }>(API_ENDPOINTS.auth.login, { username, password });

    if (error) {
      logger.auth.error("Login failed", new Error(error), { username, duration: Math.round(performance.now() - startTime) });
      throw new Error(error);
    }

    if (data) {
      localStorage.setItem("access_token", data.tokens.access);
      localStorage.setItem("refresh_token", data.tokens.refresh);
      setUser(data.user);
      logger.auth.info("Login successful", { 
        username: data.user.username, 
        userId: data.user.id,
        duration: Math.round(performance.now() - startTime)
      });
    }
  };

  const register = async (username: string, email: string, password: string, firstName?: string, lastName?: string) => {
    logger.auth.info("Attempting registration", { username, email, hasFirstName: !!firstName, hasLastName: !!lastName });
    const startTime = performance.now();
    
    // Build payload, only include first_name/last_name if they have values
    const payload: any = {
      username, 
      email, 
      password,
      password2: password, // Backend expects password confirmation
    };
    
    if (firstName) payload.first_name = firstName;
    if (lastName) payload.last_name = lastName;
    
    const { data, error } = await apiPost<{
      tokens: {
        access: string;
        refresh: string;
      };
      user: User;
      message: string;
    }>(API_ENDPOINTS.auth.register, payload);

    if (error) {
      logger.auth.error("Registration failed", new Error(error), { 
        username, 
        email,
        duration: Math.round(performance.now() - startTime)
      });
      throw new Error(error);
    }

    // Auto-login after successful registration since backend returns tokens
    if (data && data.tokens) {
      localStorage.setItem("access_token", data.tokens.access);
      localStorage.setItem("refresh_token", data.tokens.refresh);
      setUser(data.user);
    }
  };

  const logout = async () => {
    const currentUser = user?.username;
    logger.auth.info("User logging out", { username: currentUser });
    const refreshToken = localStorage.getItem("refresh_token");

    // Attempt backend logout with refresh token so server can revoke it
    if (refreshToken) {
      try {
        await apiPost(API_ENDPOINTS.auth.logout, { refresh: refreshToken });
      } catch (err) {
        // Non-blocking: proceed to clear tokens even if server errors
        logger.auth.warn("Backend logout failed, proceeding to clear tokens", err as Error);
      }
    } else {
      logger.auth.debug("No refresh token found during logout");
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    logger.auth.info("Logout successful", { username: currentUser });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
