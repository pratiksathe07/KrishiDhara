import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard", href: "/labor/dashboard" },
  { icon: "📋", label: "My Profile", href: "#" },
  { icon: "🔍", label: "Find Work", href: "#" },
  { icon: "📅", label: "My Jobs", href: "#" },
  { icon: "💰", label: "Earnings", href: "#" },
];

const LaborDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <header className="bg-white border-b border-surface-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <span className="text-lg font-bold text-primary-700">KrishiDhara</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium bg-earth-100 text-earth-700 rounded-full px-2 py-0.5">
              Labor
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600 font-medium">
              {user?.firstName} {user?.lastName}
            </span>
            <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-600 transition">
              Logout
            </button>
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
        </aside>

        <main className="flex-1 space-y-5">
          <div className="bg-gradient-to-r from-earth-500 to-earth-600 rounded-2xl p-6 text-white shadow-md">
            <h1 className="text-xl sm:text-2xl font-bold mb-1">Welcome, {user?.firstName}! 👋</h1>
            <p className="text-orange-100 text-sm">Find agricultural work and connect with farmers near you.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: "📅", label: "Active Jobs", value: "0" },
              { icon: "✅", label: "Completed", value: "0" },
              { icon: "⭐", label: "Rating", value: "—" },
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
              {user?.laborProfile && (
                <>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Experience</p>
                    <p className="font-medium text-gray-900">{user.laborProfile.experienceYears} {user.laborProfile.experienceYears === 1 ? "year" : "years"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-gray-500 text-xs mb-1.5">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {user.laborProfile.skills.length > 0
                        ? user.laborProfile.skills.map((s) => (
                            <span key={s} className="chip chip-selected text-xs">{s}</span>
                          ))
                        : <span className="text-xs text-gray-400">No skills added</span>
                      }
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LaborDashboard;
