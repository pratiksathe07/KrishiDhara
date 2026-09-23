import api from "./api";

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },

  getAllUsers: async (filters = {}) => {
    // Clean up filters to remove undefined/empty strings
    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v != null && v !== "")
    );
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await api.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
};
