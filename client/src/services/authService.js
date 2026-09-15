import api from "./api";

/** Step 1: Request registration OTP */
export const requestOTP = (data) => api.post("/auth/request-otp", data);

/** Step 2: Verify registration OTP */
export const verifyOTP = (data) => api.post("/auth/verify-otp", data);

/** Step 3: Complete registration */
export const register = (data) => api.post("/auth/register", data);

/** Login Step 1: Request login OTP */
export const loginRequestOTP = (data) => api.post("/auth/login/request-otp", data);

/** Login Step 2: Verify login OTP */
export const loginVerifyOTP = (data) => api.post("/auth/login/verify-otp", data);

/** Logout */
export const logout = () => api.post("/auth/logout");

/** Get current authenticated user */
export const getMe = () => api.get("/auth/me");
