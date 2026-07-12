import { NextResponse } from 'next/server';
import { getDb } from '@/lib/server-init';
import { sendEmail, getForgotPasswordOtpEmailHtml } from '@/lib/email';

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    console.log('[API - forgot-password-request] Received forgot password request.');

    // 13. If the API key is missing, immediately return 500 and the specified payload
    const apiKey = process.env.RESEND_API_KEY;
    const hasApiKey = !!(apiKey && apiKey.trim() !== "");
    console.log('[API - forgot-password-request] RESEND_API_KEY exists:', hasApiKey);

    if (!hasApiKey) {
      console.error('[API - forgot-password-request] RESEND_API_KEY is missing. Aborting.');
      return NextResponse.json({
        success: false,
        error: "RESEND_API_KEY missing"
      }, { status: 500 });
    }

    const database = await getDb();
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      console.error('[API - forgot-password-request] Request failed: Email address is required.');
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const user = await database.collection('users').findOne({ email });
    if (!user) {
      console.warn(`[API - forgot-password-request] Request failed: Email ${email} not found.`);
      return NextResponse.json({ error: 'Client email address not found in our registry.' }, { status: 404 });
    }

    // Cooldown rate limit (60 seconds)
    if (user.otp && Date.now() - (user.otp.lastRequestedAt || 0) < 60000) {
      const waitSecs = Math.ceil((60000 - (Date.now() - user.otp.lastRequestedAt)) / 1000);
      console.warn(`[API - forgot-password-request] Request throttled: client must wait ${waitSecs} seconds.`);
      return NextResponse.json({ error: `Please wait ${waitSecs} seconds before requesting another code.` }, { status: 429 });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 14. Ensure forgot-password-request only returns success after Resend confirms the email was accepted.
    // Prepare email html and plain text before DB write to ensure we are ready.
    const otpEmailHtml = getForgotPasswordOtpEmailHtml(otpCode);

    console.log(`[API - forgot-password-request] Dispatching reset code to ${email}...`);

    try {
      // 7. Validate resend.emails.send() inside sendEmail and await confirmation
      const emailResult = await sendEmail({
        to: email,
        subject: 'VELORA • Password Reset Code',
        html: otpEmailHtml,
        text: `Your verification code is:\n\n${otpCode}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, simply ignore this email.`
      });

      if (!emailResult || !emailResult.success) {
        throw new Error('Email provider did not return success.');
      }

      console.log(`[API - forgot-password-request] Email accepted by Resend successfully. Transaction ID: ${emailResult.id}`);

    } catch (err) {
      // 3. If Resend fails, return HTTP 500 instead of success.
      // 10. Return detailed JSON structure for failure.
      console.error('[API - forgot-password-request] Resend transmission failed:', err);
      return NextResponse.json({
        success: false,
        provider: "resend",
        error: err.message || JSON.stringify(err)
      }, { status: 500 });
    }

    // If email sent successfully, update the database with OTP
    await database.collection('users').updateOne(
      { email },
      {
        $set: {
          otp: {
            code: otpCode,
            expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
            lastRequestedAt: Date.now(),
            attempts: 0,
            verified: false
          }
        }
      }
    );

    console.log('[API - forgot-password-request] Database successfully updated with reset OTP code details.');

    return NextResponse.json({
      success: true,
      message: 'Premium security reset OTP code has been dispatched to your email.'
    });

  } catch (e) {
    console.error('[API - forgot-password-request] General handler failure:', e);
    return NextResponse.json({
      success: false,
      error: e.message
    }, { status: 500 });
  }
}
