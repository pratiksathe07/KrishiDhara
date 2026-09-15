/**
 * Environment variable configuration.
 * Validates required vars at startup so missing config fails fast.
 */
const required = [
  "MONGO_URI",
  "JWT_SECRET",
  "VERIFICATION_TOKEN_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "EMAIL_FROM",
  "CLIENT_URL",
];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  VERIFICATION_TOKEN_SECRET: process.env.VERIFICATION_TOKEN_SECRET,
  VERIFICATION_TOKEN_EXPIRES_IN: process.env.VERIFICATION_TOKEN_EXPIRES_IN || "10m",
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT, 10) || 5000,
  CLIENT_URL: process.env.CLIENT_URL,
};
