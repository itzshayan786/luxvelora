import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Lazy-initialized transporter to avoid crashes if credentials are not configured yet
let transporter = null;
let resendClient = null;

function getResend() {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && apiKey.trim() !== "") {
    resendClient = new Resend(apiKey);
    return resendClient;
  }
  return null;
}

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user,
        pass,
      },
    });
    return transporter;
  }
  return null;
}

const LUXURY_EMAIL_WRAPPER = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #fafaf9;
      color: #0a0a0a;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #fafaf9;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e5e5e0;
      padding: 48px;
      box-sizing: border-box;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .brand {
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #0a0a0a;
      text-decoration: none;
      margin: 0;
    }
    .subtitle {
      font-size: 9px;
      letter-spacing: 0.3em;
      color: #737373;
      text-transform: uppercase;
      margin-top: 8px;
    }
    .content {
      font-size: 14px;
      line-height: 1.6;
      color: #171717;
      margin-bottom: 32px;
    }
    .cta-button {
      display: inline-block;
      background-color: #0a0a0a;
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 32px;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      text-align: center;
      margin: 24px 0;
      transition: background-color 0.2s ease;
    }
    .otp-box {
      background-color: #f5f5f4;
      border: 1px solid #e5e5e0;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-code {
      font-family: monospace;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 0.3em;
      color: #0a0a0a;
      margin: 0;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #737373;
      letter-spacing: 0.05em;
      line-height: 1.5;
      border-top: 1px solid #f5f5f4;
      padding-top: 24px;
      margin-top: 40px;
    }
    .footer a {
      color: #0a0a0a;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div className="header">
        <div class="brand">VELORA</div>
        <div class="subtitle">PREMIUM ETHNIC WEAR</div>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        This email was sent by VELORA.<br>
        Bengaluru, Karnataka, India.<br>
        <br>
        © ${new Date().getFullYear()} VELORA. All rights reserved.<br>
        <a href="#">Privacy Policy</a> • <a href="#">Terms of Service</a>
      </div>
    </div>
  </div>
</body>
</html>
`;

export async function sendEmail({ to, subject, html, text }) {
  console.log('[Email Service] Initiating email transmission...');

  // 5. Validate process.env.RESEND_API_KEY
  const apiKey = process.env.RESEND_API_KEY;
  const hasApiKey = !!(apiKey && apiKey.trim() !== "");
  console.log('[Email Service] RESEND_API_KEY exists:', hasApiKey);

  // 15. Check if Vercel environment variables are correctly read
  console.log('[Email Service] Environment context checks:');
  console.log('  - VERCEL:', !!process.env.VERCEL);
  console.log('  - VERCEL_ENV:', process.env.VERCEL_ENV || 'not-set');
  console.log('  - NODE_ENV:', process.env.NODE_ENV || 'not-set');

  if (!hasApiKey) {
    const errorMsg = 'RESEND_API_KEY missing';
    console.error(`[Email Service] Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // 6. Validate process.env.EMAIL_FROM
  let fromEmail = process.env.EMAIL_FROM || '';
  console.log('[Email Service] Raw EMAIL_FROM:', fromEmail);

  // Simple regex check for valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isFromEmailValid = emailRegex.test(fromEmail) && !fromEmail.includes('yourdomain.com') && !fromEmail.includes('example.com');

  if (!isFromEmailValid) {
    // 12. If EMAIL_FROM is invalid, automatically use onboarding@resend.dev for development
    console.warn(`[Email Service] EMAIL_FROM ("${fromEmail}") is invalid or generic. Defaulting to onboarding@resend.dev for development.`);
    fromEmail = 'onboarding@resend.dev';
  }
  console.log('[Email Service] Final EMAIL_FROM resolved as:', fromEmail);

  // Initialize Resend client
  console.log('[Email Service] Initializing Resend client...');
  const resend = new Resend(apiKey);

  // 11. Add server-side logging for Resend request
  const requestDetails = {
    from: fromEmail,
    to,
    subject,
    textLength: text ? text.length : 0,
    htmlLength: html ? html.length : 0,
  };
  console.log('[Email Service] Resend request details:', JSON.stringify(requestDetails, null, 2));

  try {
    // 7. Validate resend.emails.send()
    const response = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text,
    });

    // 4 & 11. Log the exact Resend response
    console.log('[Email Service] Resend response received:', JSON.stringify(response, null, 2));

    if (response.error) {
      // 8. Throw any Resend errors instead of swallowing them
      console.error('[Email Service] Resend error detected:', JSON.stringify(response.error, null, 2));
      const err = new Error(response.error.message || JSON.stringify(response.error));
      err.provider = 'resend';
      err.rawError = response.error;
      throw err;
    }

    if (!response.data || !response.data.id) {
      console.error('[Email Service] Resend returned success but without email transaction ID.');
      const err = new Error('No data or email transaction ID received from Resend response.');
      err.provider = 'resend';
      throw err;
    }

    console.log(`[Email Service] Email accepted by Resend provider. Transaction ID: ${response.data.id}`);
    return {
      success: true,
      provider: 'resend',
      id: response.data.id
    };

  } catch (error) {
    // 11. Add server-side logging for Resend error
    console.error('[Email Service] Resend error during execution:', error);
    throw error;
  }
}

// 1. Welcome Email Template
export function getWelcomeEmailHtml(name) {
  const content = `
    <p>Dear ${name || 'Customer'},</p>
    <p>Welcome to <b>VELORA</b>. Your account has been registered successfully.</p>
    <p>You now have access to our latest arrivals, special sales, and exclusive festive collections.</p>
    <p>We have credited <b>100 welcome reward points</b> to your account. You can view these inside your account dashboard at any time.</p>
    <p>We hope you enjoy shopping with us.</p>
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://veloracouture.com'}" class="cta-button">SHOP NOW</a>
    </div>
    <p style="margin-top: 30px;">Warm regards,<br><b>VELORA Support Team</b></p>
  `;
  return LUXURY_EMAIL_WRAPPER('Welcome to VELORA', content);
}

// 2. Email Verification Template
export function getVerificationEmailHtml(name, code) {
  const content = `
    <p>Dear ${name || 'Customer'},</p>
    <p>Thank you for registering with <b>VELORA</b>.</p>
    <p>Please verify your email address by entering the verification code below:</p>
    
    <div class="otp-box">
      <div class="otp-code">${code}</div>
    </div>
    
    <p>This verification code is valid for 10 minutes. If you did not register for an account, please disregard this email.</p>
    <p>Warm regards,<br><b>VELORA Support Team</b></p>
  `;
  return LUXURY_EMAIL_WRAPPER('Verify Your VELORA Account', content);
}

// 3. Forgot Password OTP Template (Strictly matching the requested layout)
export function getForgotPasswordOtpEmailHtml(code) {
  const content = `
    <p style="font-size: 14px; line-height: 1.6; color: #171717;">Your verification code is:</p>
    
    <div class="otp-box" style="margin: 24px 0; background-color: #f5f5f4; border: 1px solid #e5e5e0; padding: 24px; text-align: center;">
      <div class="otp-code" style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 0.3em; color: #0a0a0a; margin: 0;">${code}</div>
    </div>
    
    <p style="font-size: 14px; line-height: 1.6; color: #171717;">This code expires in 10 minutes.</p>
    <p style="font-size: 14px; line-height: 1.6; color: #171717;">If you did not request this, simply ignore this email.</p>
  `;
  return LUXURY_EMAIL_WRAPPER('VELORA • Password Reset Code', content);
}

// 4. Password Changed Successfully Template
export function getPasswordChangedEmailHtml(name) {
  const content = `
    <p>Dear ${name || 'Customer'},</p>
    <p>This message is a confirmation that your <b>VELORA account password has been updated successfully</b>.</p>
    <p>If you authorized this change, no further action is required.</p>
    <p>If you did not make this change, please contact our support team immediately.</p>
    <p>Warm regards,<br><b>VELORA Support Team</b></p>
  `;
  return LUXURY_EMAIL_WRAPPER('VELORA • Security Password Updated', content);
}
