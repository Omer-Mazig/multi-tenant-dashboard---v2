import { useEffect, useState } from "react";
import { useTenantActivity } from "../contexts/TenantActivityContext";

interface TenantInfo {
  id: string;
  name: string;
  subdomain: string;
}

export default function TenantDashboardPage() {
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { tenantSessionExpired } = useTenantActivity();

  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const response = await fetch("/api/tenants/current", {
          credentials: "include",
        });

        if (response.ok) {
          // If the response has content, parse it; otherwise set null
          const rawText = await response.text();
          if (rawText) {
            try {
              const data: TenantInfo = JSON.parse(rawText);
              setTenantInfo(data);
            } catch (parseErr) {
              console.error("Error parsing tenant info JSON:", parseErr);
              setTenantInfo(null);
            }
          } else {
            setTenantInfo(null);
          }
        } else {
          console.error("Failed to fetch tenant info", response.status);
          const errorText = await response.text();
          console.error("Response text:", errorText);
        }
      } catch (error) {
        console.error("Error fetching tenant info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading tenant information...
      </div>
    );
  }

  if (!tenantInfo) {
    return (
      <div className="text-center p-8 text-gray-700">
        Unable to load tenant information.
      </div>
    );
  }

  return (
    <div className="py-6 px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Dashboard for {tenantInfo.name}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 pb-3 mb-4 border-b border-gray-200">
            Tenant Information
          </h3>
          <p className="mb-2 text-gray-700">
            ID: <span className="font-medium">{tenantInfo.id}</span>
          </p>
          <p className="mb-2 text-gray-700">
            Name: <span className="font-medium">{tenantInfo.name}</span>
          </p>
          <p className="text-gray-700">
            Subdomain:{" "}
            <span className="font-medium">{tenantInfo.subdomain}</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 pb-3 mb-4 border-b border-gray-200">
            Activity Status
          </h3>
          <p className="mb-3 text-green-600 font-medium">
            Your session is currently active.
          </p>
          <p className="text-sm text-gray-500 italic">
            Note: After 20 seconds of inactivity in this tenant, your session
            will expire and you will be logged out.
          </p>
        </div>
      </div>
    </div>
  );
}
