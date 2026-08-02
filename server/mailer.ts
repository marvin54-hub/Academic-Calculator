import nodemailer from "nodemailer";

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

/**
 * Sends a password reset email if SMTP is configured. If it isn't, this app
 * has no email provider to fall back on, so we return the link to the caller
 * instead of silently pretending an email was sent.
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  resetLink: string
): Promise<{ delivered: boolean }> {
  if (!smtpConfigured()) {
    return { delivered: false };
  }

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || "Academic Calculator <no-reply@academic-calculator.app>",
    to: toEmail,
    subject: "Reset your Academic Calculator password",
    text: `We received a request to reset your password. Click the link below to choose a new one. This link expires in 15 minutes.\n\n${resetLink}\n\nIf you didn't request this, you can ignore this email.`,
    html: `<p>We received a request to reset your password.</p><p><a href="${resetLink}">Click here to choose a new password</a> (expires in 15 minutes).</p><p>If you didn't request this, you can ignore this email.</p>`,
  });

  return { delivered: true };
}
