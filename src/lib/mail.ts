import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Reset your EventPremium password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#735c00;">EventPremium</h2>
        <p>You requested a password reset.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#735c00;color:#fff;text-decoration:none;border-radius:8px;">
          Reset Password
        </a>
        <p style="margin-top:24px;font-size:13px;color:#666;">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendOTPEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Your EventPremium OTP code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#735c00;">EventPremium</h2>
        <p>Use this code to reset your password:</p>
        <div style="font-size:32px;letter-spacing:8px;font-weight:700;color:#735c00;text-align:center;padding:24px;background:#f5eddf;border-radius:12px;margin:16px 0;">
          ${otp}
        </div>
        <p style="font-size:13px;color:#666;">This code expires in 2 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}
