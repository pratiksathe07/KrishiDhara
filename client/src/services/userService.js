import api from "./api";

/**
 * Fetch all registered labour users.
 * @param {string[]} skills - optional array of skill strings to filter by (OR logic)
 */
export const getLabours = (skills = []) => {
  const params = skills.length > 0 ? { skills: skills.join(",") } : {};
  return api.get("/users/labours", { params });
};

// GET /api/users/dealers?products=Wheat,Rice / Paddy
export const getDealers = (products = []) => {
  const params = products.length > 0 ? { products: products.join(",") } : {};
  return api.get("/users/dealers", { params });
};

/**
  * Fetch all active dealer purchase requirements (for farmers).
  * @param {Object} params - optional filters: { crop, quantityUnit, location, search }
  */
export const getActiveDealerRequirements = (params = {}) => {
  return api.get("/dealer/active-requirements", { params });
};

/**
 * Upload or update the logged-in user's profile picture.
 * @param {FormData} formData - FormData containing 'profilePicture' file
 */
export const uploadProfilePicture = (formData) => {
  return api.put("/users/profile-picture", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Remove the logged-in user's profile picture.
 */
export const deleteProfilePicture = () => {
  return api.delete("/users/profile-picture");
};
