import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "../../components/ui/AnimatedBackground";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/adminService";
import {
  Users,
  Tractor,
  Briefcase,
  Store,
  LogOut,
  Settings,
  TrendingUp,
  Activity,
  Menu,
  X,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  MoreVertical
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { authUser, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" or "users"
  
  // Data state
  const [stats, setStats] = useState({ farmers: 0, labours: 0, dealers: 0, activeUsers: 0 });
  const [users, setUsers] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  // Filter state for users
  const [userFilters, setUserFilters] = useState({ role: "", status: "", search: "" });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, userFilters]);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await adminService.getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      toast.error("Failed to fetch dashboard stats");
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await adminService.getAllUsers(userFilters);
      if (res.success) {
        setUsers(res.data.users);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await adminService.updateUserStatus(userId, newStatus);
      if (res.success) {
        toast.success(res.message);
        // Optimistically update
        setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
        fetchStats(); // Update stats if status changed
      }
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const res = await adminService.deleteUser(userId);
      if (res.success) {
        toast.success(res.message);
        setUsers(users.filter(u => u._id !== userId));
        fetchStats();
      }
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const statCards = [
    { title: "Total Farmers", value: stats.farmers, icon: Tractor, color: "text-blue-400", bg: "bg-blue-500/10" },
    { title: "Total Labourers", value: stats.labours, icon: Users, color: "text-orange-400", bg: "bg-orange-500/10" },
    { title: "Total Dealers", value: stats.dealers, icon: Store, color: "text-purple-400", bg: "bg-purple-500/10" },
    { title: "Active Users", value: stats.activeUsers, icon: Activity, color: "text-green-400", bg: "bg-green-500/10" },
  ];

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex text-white relative z-10 font-sans">
        
        {/* Sidebar */}
        <aside className={`fixed lg:static top-0 left-0 h-full w-64 bg-black/40 backdrop-blur-md border-r border-white/10 transition-transform duration-300 z-50 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="KrishiDhara" className="h-13 w-100 object-contain drop-shadow-md rounded-lg" />
                {/* <span className="text-xl font-bold tracking-wide">Admin</span> */}
              </div>
              <button className="lg:hidden text-white/70 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === "overview" ? "bg-white/10 text-green-400 border border-white/5" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
              >
                <TrendingUp size={20} />
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab("users")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === "users" ? "bg-white/10 text-green-400 border border-white/5" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
              >
                <Users size={20} />
                User Management
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-all">
                <Settings size={20} />
                System Settings
              </button>
            </nav>

            <div className="mt-auto border-t border-white/10 pt-6">
              <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-black/20 rounded-xl border border-white/5">
                {/* <div className="h-12 w-1000 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold shadow-lg">
                  {authUser?.firstName?.charAt(0) || "Admin"}
                </div> */}
                
                <div className="h-12 w-100 flex items-center justify-center font-bold shadow-lg"> Admin</div>
                <div>
                  <p className="text-sm font-semibold">{authUser?.firstName} {authUser?.lastName}</p>
                  <p className="text-xs text-white/50 truncate max-w-[120px]">{authUser?.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl font-medium transition-all"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="h-20 flex items-center justify-between px-8 bg-black/20 backdrop-blur-sm border-b border-white/5 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <button className="lg:hidden text-white/70 hover:text-white" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                {activeTab === "overview" ? "Overview" : "User Management"}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
               {/* Placeholders for notifications etc. */}
            </div>
          </header>

          <div className="p-8">
            
            {activeTab === "overview" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Welcome back {authUser?.firstName}! 👋</h2>
                    <p className="text-white/60">Here's what's happening in KrishiDhara today.</p>
                  </div>
                  <button onClick={fetchStats} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-white/70 hover:text-white flex items-center gap-2 text-sm">
                    <RefreshCw size={16} className={isLoadingStats ? "animate-spin" : ""} />
                    Refresh
                  </button>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                  {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center gap-5 hover:bg-black/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20">
                      <div className={`h-14 w-14 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                        <stat.icon size={28} />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm font-medium mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold">{isLoadingStats ? "..." : stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dashboard Content area */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-h-[400px]">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">Registration Activity</h3>
                        <select className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:border-green-500/50">
                          <option>Last 7 days</option>
                          <option>Last 30 days</option>
                          <option>This Year</option>
                        </select>
                     </div>
                     <div className="flex items-center justify-center h-[300px] border border-dashed border-white/10 rounded-xl bg-white/5">
                        <p className="text-white/40 font-medium flex items-center gap-2">
                           <Activity size={20} />
                           Chart Placeholder (Implement with Recharts/Chartjs later)
                        </p>
                     </div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-h-[400px]">
                     <h3 className="text-lg font-bold mb-6">System Health</h3>
                     <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-4">
                          <CheckCircle className="text-green-400" size={24} />
                          <div>
                            <p className="font-semibold text-green-400">Database Connected</p>
                            <p className="text-xs text-green-400/70">Latency: 24ms</p>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-4">
                          <Activity className="text-blue-400" size={24} />
                          <div>
                            <p className="font-semibold text-blue-400">API Server Active</p>
                            <p className="text-xs text-blue-400/70">Uptime: 99.9%</p>
                          </div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Filter Bar */}
                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search users by name, email, or mobile..." 
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-green-500/50 transition-colors"
                      value={userFilters.search}
                      onChange={(e) => setUserFilters({...userFilters, search: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <select 
                      className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-green-500/50 flex-1 md:flex-none"
                      value={userFilters.role}
                      onChange={(e) => setUserFilters({...userFilters, role: e.target.value})}
                    >
                      <option value="">All Roles</option>
                      <option value="farmer">Farmers</option>
                      <option value="labour">Labourers</option>
                      <option value="dealer">Dealers</option>
                      <option value="admin">Admins</option>
                    </select>
                    <select 
                      className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-green-500/50 flex-1 md:flex-none"
                      value={userFilters.status}
                      onChange={(e) => setUserFilters({...userFilters, status: e.target.value})}
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-white/50 uppercase bg-black/40 border-b border-white/10">
                        <tr>
                          <th className="px-6 py-4 font-semibold">User</th>
                          <th className="px-6 py-4 font-semibold">Contact Info</th>
                          <th className="px-6 py-4 font-semibold">Role</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold">Joined</th>
                          <th className="px-6 py-4 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingUsers ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-white/50">
                              <RefreshCw className="mx-auto animate-spin mb-2" size={24} />
                              Loading users...
                            </td>
                          </tr>
                        ) : users.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-white/50">
                              No users found matching your filters.
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-white shadow-lg text-xs">
                                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                                    <p className="text-xs text-white/50">{user._id.substring(user._id.length - 6)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="truncate max-w-[150px]">{user.email}</p>
                                <p className="text-white/50 text-xs mt-0.5">{user.mobile}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize border
                                  ${user.role === 'farmer' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                    user.role === 'labour' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                                    user.role === 'dealer' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                                    'bg-red-500/10 text-red-400 border-red-500/20'}`}
                                >
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-md text-xs font-medium border
                                  ${user.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                                >
                                  {user.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-white/70">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => handleToggleStatus(user._id, user.status)}
                                    className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                    title={user.status === "active" ? "Deactivate User" : "Activate User"}
                                  >
                                    {user.status === "active" ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                                    title="Delete User"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </AnimatedBackground>
  );
};

export default AdminDashboard;
