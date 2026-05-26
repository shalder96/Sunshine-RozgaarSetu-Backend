// import dotenv from "dotenv";
// dotenv.config();
import nodemailer from "nodemailer";

console.log("SMTP_HOST =", process.env.SMTP_HOST);
console.log("SMTP_PORT =", process.env.SMTP_PORT);
console.log("SMTP_USER =", process.env.SMTP_USER);
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP VERIFY ERROR:", error);
  } else {
    console.log("SMTP SERVER READY");
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    console.log("Attempting email...");

    const info = await transporter.sendMail({
      from: `RozgaarSetu <${process.env.SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("EMAIL SENT:", info);
    return info;
  } catch (err) {
    console.error("SENDMAIL ERROR:", err);
    throw err;
  }
};

export default sendEmail;
