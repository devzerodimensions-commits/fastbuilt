// Email sending for password-reset links. Configured entirely via env vars, so no
// secrets live in the repo. Supports either a generic SMTP host, or Gmail via an
// app password. If nothing is configured, forgot-password degrades gracefully
// (the reset link is logged server-side instead of emailed).
import nodemailer from 'nodemailer'

function buildTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_USER, EMAIL_PASS } = process.env
  if (SMTP_HOST) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    })
  }
  if (EMAIL_USER && EMAIL_PASS) {
    // Gmail with a 16-char App Password (recommended, free)
    return nodemailer.createTransport({ service: 'gmail', auth: { user: EMAIL_USER, pass: EMAIL_PASS } })
  }
  return null
}

// True when email delivery is configured (used to hide/show the reset UI hints).
export function mailerReady() {
  return !!(process.env.SMTP_HOST || (process.env.EMAIL_USER && process.env.EMAIL_PASS))
}

export async function sendResetEmail(to, link) {
  const transport = buildTransport()
  const from = process.env.MAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER || 'no-reply@fastbuilt.in'
  if (!transport) {
    console.warn('[mailer] email not configured — reset link for', to, ':', link)
    return false
  }
  await transport.sendMail({
    from: `Fastbuilt Admin <${from}>`,
    to,
    subject: 'Reset your Fastbuilt admin password',
    text: `We received a request to reset your Fastbuilt admin password.\n\nReset it here (valid for 1 hour):\n${link}\n\nIf you didn't request this, you can ignore this email.`,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#1d2327">
      <h2 style="margin:0 0 10px">Reset your password</h2>
      <p style="color:#555;line-height:1.5">We received a request to reset your Fastbuilt admin password. This link is valid for <b>1 hour</b>.</p>
      <p style="margin:22px 0"><a href="${link}" style="display:inline-block;background:#1d2327;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600">Set a new password</a></p>
      <p style="color:#888;font-size:13px;word-break:break-all">Or paste this link into your browser:<br>${link}</p>
      <p style="color:#888;font-size:13px">If you didn't request this, you can safely ignore this email — your password will stay the same.</p>
    </div>`,
  })
  return true
}
