import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TenantActivityProvider } from "./contexts/TenantActivityContext";
import LoginPage from "./pages/LoginPage";
import TenantSelectionPage from "./pages/TenantSelectionPage";
import TenantDashboardPage from "./pages/TenantDashboardPage";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  // Check if we're on a tenant subdomain
  const isOnTenantSubdomain = () => {
    const hostname = window.location.hostname;
    return (
      (hostname.includes(".lvh.me") && hostname !== "login.myapp.lvh.me") ||
      (hostname.includes(".localhost") && hostname !== "login.localhost")
    );
  };

  // If on tenant subdomain, show tenant dashboard, otherwise show normal routes
  return (
    <Routes>
      {isOnTenantSubdomain() ? (
        <>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TenantActivityProvider>
                  <TenantDashboardPage />
                </TenantActivityProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={<LoginPage />}
          />
          <Route
            path="*"
            element={<Navigate to="/" />}
          />
        </>
      ) : (
        <>
          <Route
            path="/login"
            element={<LoginPage />}
          />
          <Route
            path="/tenants"
            element={
              <ProtectedRoute>
                <TenantSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={<Navigate to="/login" />}
          />
          <Route
            path="*"
            element={<Navigate to="/login" />}
          />
        </>
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
