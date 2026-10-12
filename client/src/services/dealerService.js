import api from "./api";

/**
 * Fetch all active purchase requirements and registered crops for the authenticated dealer.
 */
export const getDealerRequirements = () => {
  return api.get("/dealer/requirements");
};

/**
 * Create a new crop purchase requirement for one of the dealer's registered crops.
 * @param {Object} data - { crop, quantity, quantityUnit, expectedPrice, priceUnit, deliveryLocation, qualityGrade, notes }
 */
export const createDealerRequirement = (data) => {
  return api.post("/dealer/requirements", data);
};

/**
 * Update an existing crop purchase requirement.
 * @param {string} id - Requirement ID
 * @param {Object} data - Updated fields
 */
export const updateDealerRequirement = (id, data) => {
  return api.put(`/dealer/requirements/${id}`, data);
};

/**
 * Delete a crop purchase requirement (frees up a slot).
 * @param {string} id - Requirement ID
 */
export const deleteDealerRequirement = (id) => {
  return api.delete(`/dealer/requirements/${id}`);
};
