// app/lib/mailer.ts

import nodemailer from 'nodemailer';

// Define the interface for email options for better type safety
interface MailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: string; // base64 encoded content
    encoding: 'base64';
  }[];
}

// Function to send an email
export const sendEmail = async (mailOptions: MailOptions) => {
  // 1. Verify that all required environment variables are set
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM_EMAIL) {
    console.error('Missing SMTP environment variables. Email not sent.');
    // In a real application, you might want to throw an error or handle this more gracefully
    throw new Error('SMTP configuration is incomplete. Cannot send email.');
  }
  
  // 2. Create a transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10), // Ensure port is an integer
    secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  try {
    // 3. Send the email
    const info = await transporter.sendMail({
      from: `"AVOPRO EPZ LIMITED" <${SMTP_FROM_EMAIL}>`, // Sender address
      ...mailOptions, // Spread the rest of the mail options
    });

    console.log(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Re-throw the error to be handled by the calling function if needed
    throw new Error('Failed to send email.');
  }
};

/**
 * Sends a password reset email to a user.
 * @param to - The recipient's email address.
 * @param token - The unique password reset token.
 */
export const sendPasswordResetEmail = async (to: string, token: string) => {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://avotrack.vercel.app';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Password Reset Request</h2>
      <p>You are receiving this email because a password reset request was made for your account.</p>
      <p>Please click the button below to reset your password. This link is valid for 1 hour.</p>
      <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <p>Thank you,</p>
      <p><strong>AVOPRO EPZ LIMITED</strong></p>
    </div>
  `;

  await sendEmail({
    to,
    subject: 'Your Password Reset Link',
    html,
  });
};

