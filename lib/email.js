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
      <div class="header">
        <div class="brand">VELORA</div>
        <div class="subtitle">ATELIER • LUXURY COUTURE</div>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        This email was dispatched by ATELIER VELORA Private Limited.<br>
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
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_FROM || 'onboarding@resend.dev';
  
  // 1. Try Resend if configured
  const resend = getResend();
  if (resend) {
    try {
      const result = await resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html,
        text,
      });
      if (result.error) {
        throw new Error(result.error.message || JSON.stringify(result.error));
      }
      console.log(`[Email Service - Resend] Email dispatched successfully to ${to} with ID: ${result.data?.id}`);
      return { success: true, provider: 'resend', id: result.data?.id };
    } catch (err) {
      console.error('[Email Service - Resend] Error dispatching email via Resend API:', err);
      // Fall through to other providers / console log
    }
  }

  // 2. Try Nodemailer if configured
  const client = getTransporter();
  if (client) {
    try {
      await client.sendMail({
        from: fromEmail,
        to,
        subject,
        html,
        text,
      });
      console.log(`[Email Service - SMTP] Email sent successfully to ${to} with subject "${subject}"`);
      return { success: true, provider: 'smtp' };
    } catch (err) {
      console.error('[Email Service - SMTP] Error sending email via SMTP:', err);
      return { success: false, error: err.message };
    }
  } else {
    // If SMTP is not configured and Resend is not configured (or failed), we print to the console.
    console.log('\n==================================================');
    console.log(`[DEVELOPMENT EMAIL LOG] To: ${to}`);
    console.log(`[DEVELOPMENT EMAIL LOG] Subject: ${subject}`);
    console.log(`[DEVELOPMENT EMAIL LOG] Text Body: ${text}`);
    console.log('--------------------------------------------------');
    console.log(`[DEVELOPMENT EMAIL LOG] HTML Preview follows:\n`);
    console.log(html);
    console.log('==================================================\n');
    return { success: true, loggedToConsole: true };
  }
}

// 1. Welcome Email Template
export function getWelcomeEmailHtml(name) {
  const content = `
    <p>Dear ${name || 'Patron'},</p>
    <p>Welcome to the world of <b>VELORA</b>. Your account has been registered successfully with our secure network.</p>
    <p>As a member of the Velora Couture Collective, you now have access to our limited-run drops, hand-crafted artisanal selections, and direct private sales.</p>
    <p>We have credited <b>100 starting Couture points</b> to your account as a welcome gift. You can view these inside your profile dossier at any time.</p>
    <p>We look forward to accompanying your aesthetic journey.</p>
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://veloracouture.com'}" class="cta-button">EXPLORE ATELIER</a>
    </div>
    <p style="margin-top: 30px;">Warm regards,<br><b>VELORA Concierge</b></p>
  `;
  return LUXURY_EMAIL_WRAPPER('Welcome to VELORA', content);
}

// 2. Email Verification Template
export function getVerificationEmailHtml(name, code) {
  const content = `
    <p>Dear ${name || 'Patron'},</p>
    <p>Thank you for initiating your registration with <b>VELORA</b>.</p>
    <p>To finalize your profile and secure your private access credentials, please verify your email address by inputting the verification code below:</p>
    
    <div class="otp-box">
      <div class="otp-code">${code}</div>
    </div>
    
    <p>This verification code is valid for 10 minutes. If you did not register for an account, please disregard this transmission.</p>
    <p>Warm regards,<br><b>VELORA Security</b></p>
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
    <p>Dear ${name || 'Patron'},</p>
    <p>This message is a confirmation that your <b>VELORA account password has been updated successfully</b>.</p>
    <p>If you authorized this change, no further action is required. All existing active sessions across other devices have been securely closed for your protection.</p>
    <p>If you did not initiate this change, please contact the VELORA security team immediately or reset your credentials.</p>
    <p>Warm regards,<br><b>VELORA Security Team</b></p>
  `;
  return LUXURY_EMAIL_WRAPPER('VELORA • Security Password Updated', content);
}
