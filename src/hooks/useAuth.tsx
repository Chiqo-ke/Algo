import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_ENDPOINTS, apiPost, apiGet } from "@/lib/api";

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
          console.log("🔐 Checking authentication with stored token...");
          const { data, error } = await apiGet<User>(API_ENDPOINTS.auth.user);
          if (data && !error) {
            setUser(data);
            console.log("✅ User authenticated:", data.username);
          } else {
            // Token is invalid or expired, clear it
            console.log("⚠️ Token invalid or expired, clearing...");
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }
        } catch (err) {
          // Silent fail - token expired or invalid
          console.log("⚠️ Auth check failed, clearing tokens");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      } else {
        console.log("ℹ️ No token found, user not logged in");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const { data, error } = await apiPost<{
      tokens: {
        access: string;
        refresh: string;
      };
      user: User;
    }>(API_ENDPOINTS.auth.login, { username, password });

    if (error) {
      throw new Error(error);
    }

    if (data) {
      localStorage.setItem("access_token", data.tokens.access);
      localStorage.setItem("refresh_token", data.tokens.refresh);
      setUser(data.user);
    }
  };

  const register = async (username: string, email: string, password: string, firstName?: string, lastName?: string) => {
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
      throw new Error(error);
    }

    // Auto-login after successful registration since backend returns tokens
    if (data && data.tokens) {
      localStorage.setItem("access_token", data.tokens.access);
      localStorage.setItem("refresh_token", data.tokens.refresh);
      setUser(data.user);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
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
