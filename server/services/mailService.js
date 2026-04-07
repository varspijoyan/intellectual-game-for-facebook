import nodemailer from "nodemailer";

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendPasswordCodeEmail({ to, code }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP env vars are missing");
  }

  const transporter = getTransport();
  const fromName = process.env.SMTP_FROM_NAME || "Soccer Quiz";
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject: "Your Soccer Quiz verification code",
    text: `Your verification code is ${code}. It expires in ${process.env.RESET_CODE_TTL_MINUTES || 10} minutes.`,
    html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in ${process.env.RESET_CODE_TTL_MINUTES || 10} minutes.</p>`,
  });
}
