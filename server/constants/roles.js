/**
 * Authoritative list of allowed user roles.
 * This is the single source of truth on the backend.
 * Frontend role values must match exactly.
 */
const ALLOWED_ROLES = ["farmer", "labor", "dealer"];

module.exports = { ALLOWED_ROLES };
