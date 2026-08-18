import nodemailer from "nodemailer";

function transport() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) throw new Error("SMTP_USER / SMTP_PASS not configured");
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

function from(): string {
  return process.env.MAIL_FROM || `Doodlebug <${process.env.SMTP_USER}>`;
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

/** Hand-drawn-ish HTML email shell (inline styles only, works in Gmail). */
function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#fbf7ee;font-family:'Comic Sans MS','Segoe Print','Bradley Hand',cursive,sans-serif;color:#2b2b2b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf7;border:3px solid #2b2b2b;border-radius:18px 4px 16px 6px/6px 16px 4px 18px;box-shadow:6px 6px 0 #2b2b2b">
    <tr><td style="padding:28px 32px 8px 32px">
      <div style="font-size:14px;letter-spacing:2px;text-transform:uppercase;color:#7a6f5a">Doodlebug</div>
      <h1 style="margin:6px 0 0 0;font-size:28px;line-height:1.2">${esc(title)}</h1>
    </td></tr>
    <tr><td style="padding:8px 32px 28px 32px;font-size:17px;line-height:1.55">${bodyHtml}</td></tr>
    <tr><td style="padding:0 32px 22px 32px;font-size:13px;color:#8a8070">You are getting this because someone used this address on Doodlebug. If that was not you, just ignore it — nothing will happen.</td></tr>
  </table></td></tr></table></body></html>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:22px 0"><a href="${href}" style="display:inline-block;padding:12px 22px;background:#ffd84d;color:#2b2b2b;text-decoration:none;font-weight:bold;font-size:17px;border:3px solid #2b2b2b;border-radius:14px 5px 12px 6px/6px 12px 5px 14px;box-shadow:4px 4px 0 #2b2b2b">${esc(label)}</a></p>
  <p style="font-size:13px;color:#8a8070;word-break:break-all">Or paste this link: ${esc(href)}</p>`;
}

export async function sendVerificationEmail(to: string, name: string, link: string): Promise<void> {
  const html = shell(
    `Hi ${name}, confirm your email`,
    `<p>Thanks for signing up! Click the wobbly button below to verify your email and start doodling your GitHub stats.</p>${button(link, "Verify my email")}<p style="font-size:14px;color:#8a8070">This link expires in 24 hours.</p>`,
  );
  await transport().sendMail({ from: from(), to, subject: "Verify your Doodlebug email", html, text: `Verify your email: ${link}` });
}

export async function sendPasswordResetEmail(to: string, name: string, link: string): Promise<void> {
  const html = shell(
    `Reset your password, ${name}`,
    `<p>Somebody (hopefully you) asked to reset the password for this account.</p>${button(link, "Choose a new password")}<p style="font-size:14px;color:#8a8070">This link expires in 1 hour.</p>`,
  );
  await transport().sendMail({ from: from(), to, subject: "Reset your Doodlebug password", html, text: `Reset your password: ${link}` });
}
