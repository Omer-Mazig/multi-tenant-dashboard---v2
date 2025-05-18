import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;

  return function (...args: Parameters<T>) {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait) as unknown as number;
  };
}

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
  // New ref to track if activity occurred since last heartbeat
  const activityOccurredRef = useRef<boolean>(false);

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

  // Send heartbeat to server - only called periodically by interval
  const sendHeartbeat = async () => {
    // Only send heartbeat if activity has occurred since last heartbeat
    if (activityOccurredRef.current) {
      try {
        const response = await fetch("/api/activity/heartbeat", {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          console.error("Failed to send heartbeat");
          await handleSessionExpiry();
        }

        // Reset the activity flag after successful heartbeat
        activityOccurredRef.current = false;
      } catch (error) {
        console.error("Error sending heartbeat:", error);
      }
    }
  };

  // Check if tenant session is still active - only called periodically
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
        // TODO: For production, this should be 20 minutes (1200000 ms) instead of 20 seconds
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
    activityOccurredRef.current = true;
    setTenantSessionExpired(false);
    startActivityTracking();
  };

  const startActivityTracking = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    // Send heartbeat every 10 seconds - should be less than idle timeout (20s)
    // TODO: For production, adjust to reasonable values (e.g., 5 minutes heartbeat, 20 minutes idle)
    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, 10000) as unknown as number;

    // Check tenant session every 15 seconds - should be less than idle timeout (20s)
    // TODO: For production, adjust to reasonable values (e.g., 2-3 minutes check, 20 minutes idle)
    activityTimeoutRef.current = setInterval(() => {
      checkTenantSession();
    }, 15000) as unknown as number;

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
      activityOccurredRef.current = true;
      startActivityTracking();
    }
  }, [user]);

  // Reset activity tracking when user changes
  useEffect(() => {
    if (user) {
      lastActivityRef.current = new Date();
      activityOccurredRef.current = true;
      startActivityTracking();
    } else {
      clearHeartbeat();
      setIsActive(false);
    }

    // Event listeners for user activity - only update local state, don't call API
    const handleActivityInternal = () => {
      lastActivityRef.current = new Date();
      activityOccurredRef.current = true;
      setIsActive(true);
    };

    // Debounce activity handler to reduce state updates (300ms wait)
    const handleActivity = debounce(handleActivityInternal, 300);

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
