import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface TenantActivityContextType {
  isActive: boolean;
  tenantSessionExpired: boolean;
  resetTenantSession: () => void;
}

const TenantActivityContext = createContext<
  TenantActivityContextType | undefined
>(undefined);

export const useTenantActivity = () => {
  const context = useContext(TenantActivityContext);
  if (!context) {
    throw new Error(
      "useTenantActivity must be used within a TenantActivityProvider"
    );
  }
  return context;
};

interface TenantActivityProviderProps {
  children: ReactNode;
}

export const TenantActivityProvider = ({
  children,
}: TenantActivityProviderProps) => {
  const { user, logout } = useAuth();
  const [isActive, setIsActive] = useState(true);
  const [tenantSessionExpired, setTenantSessionExpired] = useState(false);
  const heartbeatIntervalRef = useRef<number | null>(null);
  const activityTimeoutRef = useRef<number | null>(null);
  const lastActivityRef = useRef<Date>(new Date());
  const initializedRef = useRef<boolean>(false);

  // Handle session expiry by logging out and redirecting
  const handleSessionExpiry = async () => {
    clearHeartbeat(); // Clear intervals first

    try {
      // Call logout endpoint directly to ensure cookie is cleared
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Call the auth context logout to clear local state
      await logout();

      // Redirect to login page on the main domain
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : "";
      const baseHost = "login.myapp.lvh.me";
      window.location.href = `${protocol}//${baseHost}${port}/login`;
    } catch (error) {
      console.error("Error during session expiry:", error);
      // Force redirect to login even if logout fails
      window.location.href = "/login";
    }
  };

  // Send heartbeat to server
  const sendHeartbeat = async () => {
    try {
      const response = await fetch("/api/activity/heartbeat", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Failed to send heartbeat");
        await handleSessionExpiry();
      }
    } catch (error) {
      console.error("Error sending heartbeat:", error);
    }
  };

  // Check if tenant session is still active
  const checkTenantSession = async () => {
    try {
      const response = await fetch("/api/activity/check", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        await handleSessionExpiry();
      } else {
        const now = new Date();
        const timeSinceLastActivity =
          now.getTime() - lastActivityRef.current.getTime();

        // If no activity for more than 20 seconds, expire the session
        if (timeSinceLastActivity >= 20000) {
          await handleSessionExpiry();
        } else {
          setTenantSessionExpired(false);
          setIsActive(true);
        }
      }
    } catch (error) {
      console.error("Error checking tenant session:", error);
      await handleSessionExpiry();
    }
  };

  const resetTenantSession = () => {
    lastActivityRef.current = new Date();
    setTenantSessionExpired(false);
    startActivityTracking();
  };

  const startActivityTracking = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    // Send heartbeat every 5 seconds
    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, 5000) as unknown as number;

    // Check tenant session every 2 seconds
    activityTimeoutRef.current = setInterval(() => {
      checkTenantSession();
    }, 2000) as unknown as number;

    // Send initial heartbeat
    sendHeartbeat();
  };

  const clearHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (activityTimeoutRef.current) {
      clearInterval(activityTimeoutRef.current);
      activityTimeoutRef.current = null;
    }
  };

  // Initialize activity tracking
  useEffect(() => {
    if (!initializedRef.current && user) {
      initializedRef.current = true;
      lastActivityRef.current = new Date();
      startActivityTracking();
    }
  }, [user]);

  // Reset activity tracking when user changes
  useEffect(() => {
    if (user) {
      lastActivityRef.current = new Date();
      startActivityTracking();
    } else {
      clearHeartbeat();
      setIsActive(false);
    }

    // Event listeners for user activity
    const handleActivity = () => {
      lastActivityRef.current = new Date();
      setIsActive(true);
      sendHeartbeat();
    };

    // Track user activity on the page
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("focus", handleActivity);

    return () => {
      clearHeartbeat();
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("focus", handleActivity);
    };
  }, [user]);

  const value = {
    isActive,
    tenantSessionExpired,
    resetTenantSession,
  };

  return (
    <TenantActivityContext.Provider value={value}>
      {children}
    </TenantActivityContext.Provider>
  );
};
