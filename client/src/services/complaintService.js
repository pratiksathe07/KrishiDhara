import api from "./api";

export const complaintService = {
  /**
   * Fetch complaint summary counts for stat cards
   */
  getComplaintStats: async () => {
    const response = await api.get("/complaints/stats");
    return response.data;
  },

  /**
   * Fetch complaints list with optional filtering and search
   * @param {Object} filters - { status, type, priority, search }
   */
  getAllComplaints: async (filters = {}) => {
    // Remove empty strings or "all" values from params
    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v != null && v !== "" && v !== "all")
    );
    const response = await api.get("/complaints", { params });
    return response.data;
  },

  /**
   * Update complaint status, priority, and admin notes
   * @param {string} id - Complaint ID
   * @param {Object} data - { status, priority, adminNote }
   */
  updateComplaint: async (id, data) => {
    const response = await api.patch(`/complaints/${id}`, data);
    return response.data;
  },

  /**
   * Create a complaint/report
   */
  createComplaint: async (data) => {
    const response = await api.post("/complaints", data);
    return response.data;
  },

  /**
   * Delete an individual complaint/report
   * @param {string} id - Complaint ID
   */
  deleteComplaint: async (id) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },
};
