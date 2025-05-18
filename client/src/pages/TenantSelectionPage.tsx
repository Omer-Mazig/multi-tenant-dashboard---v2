import { useAuth } from "../contexts/AuthContext";

export default function TenantSelectionPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8 text-gray-700">
        Please login to view your tenants.
      </div>
    );
  }

  const navigateToTenant = (subdomain: string) => {
    // Always use lvh.me instead of localhost
    const baseHost = "myapp.lvh.me";

    // Build the tenant URL
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : "";
    const tenantUrl = `${protocol}//${subdomain}.${baseHost}${port}`;

    // Navigate to tenant subdomain
    window.location.href = tenantUrl;
  };

  return (
    <div className="py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Select a Tenant</h2>

      {user.tenants.length === 0 ? (
        <p className="text-gray-600">You don't have access to any tenants.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {user.tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {tenant.name}
              </h3>
              <button
                onClick={() => navigateToTenant(tenant.subdomain)}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Access Tenant
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
