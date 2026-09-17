import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../../components/LogoutButton";
import { Sprout } from "lucide-react";

const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard", href: "/dealer/dashboard" },
  { icon: "🏪", label: "My Products", href: "#" },
  { icon: "🌾", label: "Farmer Leads", href: "#" },
  { icon: "📊", label: "Analytics", href: "#" },
  { icon: "💬", label: "Messages", href: "#" },
];

const DealerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <header className="bg-white border-b border-surface-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="KrishiDhara Logo" className="h-14 w-auto object-contain rounded-lg" />
            <span className="hidden sm:inline-block ml-2 text-xs font-medium bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
              Dealer
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600 font-medium">{user?.firstName} {user?.lastName}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        <aside className="hidden md:flex flex-col w-56 shrink-0 gap-1">
          {NAV_ITEMS.map((item) => (
            <a key={item.label} href={item.href} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition">
              <span>{item.icon}</span>{item.label}
            </a>
          ))}
          <LogoutButton variant="sidebar" />
        </aside>

        <main className="flex-1 space-y-5">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-md">
            <h1 className="text-xl sm:text-2xl font-bold mb-1">Welcome, {user?.firstName}! 👋</h1>
            <p className="text-blue-100 text-sm">Connect with farmers and grow your agricultural business.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: "🛒", label: "Active Listings", value: "0" },
              { icon: "👨‍🌾", label: "Farmer Contacts", value: "0" },
              { icon: "📦", label: "Products", value: user?.dealerProfile?.products?.length || "0" },
            ].map((stat) => (
              <div key={stat.label} className="card !p-5 flex flex-col gap-2">
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Your Profile</h2>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><p className="text-gray-500 text-xs mb-0.5">Full Name</p><p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p></div>
              <div><p className="text-gray-500 text-xs mb-0.5">Email</p><p className="font-medium text-gray-900">{user?.email}</p></div>
              <div><p className="text-gray-500 text-xs mb-0.5">Mobile</p><p className="font-medium text-gray-900">{user?.mobile}</p></div>
              <div><p className="text-gray-500 text-xs mb-0.5">Address</p><p className="font-medium text-gray-900">{user?.address || "—"}</p></div>
              {user?.dealerProfile && user.dealerProfile.products.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="text-gray-500 text-xs mb-1.5">Products</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.dealerProfile.products.map((p) => (
                      <span key={p} className="chip chip-selected text-xs">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DealerDashboard;
