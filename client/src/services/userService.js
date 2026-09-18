import api from "./api";

/**
 * Fetch all registered labour users.
 * @param {string[]} skills - optional array of skill strings to filter by (OR logic)
 */
export const getLabours = (skills = []) => {
  const params = skills.length > 0 ? { skills: skills.join(",") } : {};
  return api.get("/users/labours", { params });
};

/**
 * Fetch all registered dealer users.
 * @param {string[]} products - optional array of product strings to filter by (OR logic)
 */
export const getDealers = (products = []) => {
  const params = products.length > 0 ? { products: products.join(",") } : {};
  return api.get("/users/dealers", { params });
};
