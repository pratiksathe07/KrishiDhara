import api from "./api";

/**
 * Create a new labour requirement (Farmer only)
 * @param {Object} data - { title, workType, laboursNeeded, wagePerDay, wageUnit, startDate, durationDays, location, description, urgency }
 */
export const createLabourRequirement = (data) => {
  return api.post("/labour-requirements", data);
};

/**
 * Get all labour requirements created by the logged-in farmer
 * @param {string} status - Optional filter: 'active' | 'completed' | 'cancelled'
 */
export const getMyLabourRequirements = (status = "") => {
  const params = status ? { status } : {};
  return api.get("/labour-requirements/my", { params });
};

/**
 * Get all active labour requirements (marketplace view for labours/farmers)
 * @param {Object} params - { workType, district, search, status, page, limit }
 */
export const getAllLabourRequirements = (params = {}) => {
  return api.get("/labour-requirements", { params });
};

/**
 * Get single requirement details by ID
 * @param {string} id - Requirement ID
 */
export const getLabourRequirementById = (id) => {
  return api.get(`/labour-requirements/${id}`);
};

/**
 * Update an existing labour requirement
 * @param {string} id - Requirement ID
 * @param {Object} data - Updated fields
 */
export const updateLabourRequirement = (id, data) => {
  return api.put(`/labour-requirements/${id}`, data);
};

/**
 * Update requirement status (active, completed, cancelled)
 * @param {string} id - Requirement ID
 * @param {string} status - 'active' | 'completed' | 'cancelled'
 */
export const updateLabourRequirementStatus = (id, status) => {
  return api.patch(`/labour-requirements/${id}/status`, { status });
};

/**
 * Delete a labour requirement
 * @param {string} id - Requirement ID
 */
export const deleteLabourRequirement = (id) => {
  return api.delete(`/labour-requirements/${id}`);
};
