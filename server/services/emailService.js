const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS, EMAIL_FROM, NODE_ENV } = require("../config/env");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Professional OTP email HTML template.
 * Mobile-friendly, inline CSS, no external resources.
 */
const buildOTPEmailHTML = (firstName, otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KrishiDhara OTP</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7f0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="100%" max-width="500" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.05);max-width:500px;width:100%;margin:0 auto;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#16a34a;padding:30px 20px;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;letter-spacing:1px;">🌾 KrishiDhara</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 30px;">
              <p style="margin:0 0 20px 0;font-size:16px;color:#374151;line-height:1.5;">
                Hello <strong>${firstName}</strong>,
              </p>
              <p style="margin:0 0 20px 0;font-size:16px;color:#374151;line-height:1.5;">
                Please use the verification code below to securely sign in or complete your registration.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:10px 0;">
                    <div style="background-color:#f3f4f6;border:2px dashed #d1d5db;border-radius:8px;padding:20px;text-align:center;">
                      <span style="font-size:32px;font-weight:700;color:#111827;letter-spacing:6px;">${otp}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0 0;font-size:14px;color:#6b7280;line-height:1.5;text-align:center;">
                This code will expire in <strong>5 minutes</strong>. Do not share it with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                If you did not request this code, you can safely ignore this email.
              </p>
              <p style="margin:10px 0 0 0;font-size:12px;color:#9ca3af;">
                © 2024 KrishiDhara. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Send OTP via Gmail
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.firstName - Recipient first name (for greeting)
 * @param {string} params.otp - Plaintext OTP to embed in email
 * @returns {Promise<void>}
 */
const sendOTPEmail = async ({ to, firstName, otp }) => {
  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: to,
      subject: "Your KrishiDhara Verification OTP",
      html: buildOTPEmailHTML(firstName, otp),
    });

    if (NODE_ENV !== "production") {
      console.log("─────────────────────────────────────────────");
      console.log(`[DEV] OTP Email successfully sent to: ${to}`);
      console.log(`[DEV] OTP Code is : ${otp}`);
      console.log("─────────────────────────────────────────────");
    }
  } catch (error) {
    // Log full error details in development for debugging
    console.error("Email send failed:", JSON.stringify(error, null, 2));

    // DEV FALLBACK: Print OTP to server console so you can test without email
    // This NEVER runs in production (NODE_ENV=production)
    if (NODE_ENV !== "production") {
      console.log("─────────────────────────────────────────────");
      console.log(`[DEV] EMAIL FAILED — Using console fallback`);
      console.log(`[DEV] Recipient : ${to}`);
      console.log(`[DEV] OTP Code  : ${otp}`);
      console.log("[DEV] Copy the OTP above and paste it in the browser.");
      console.log("─────────────────────────────────────────────");
      return;
    }

    throw new Error("Failed to send OTP email. Please try again.");
  }
};

module.exports = { sendOTPEmail };
