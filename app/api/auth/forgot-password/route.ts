// app/api/auth/forgot-password/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/app/lib/mailer';


const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse(JSON.stringify({ message: 'Email is required' }), { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // IMPORTANT: Always return a generic success message to prevent email enumeration.
    if (!user) {
      console.log(`Password reset requested for non-existent user: ${email}`);
      return new NextResponse(JSON.stringify({ message: 'If an account with that email exists, a reset link has been sent.' }), { status: 200 });
    }

    // Create a unique, secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set an expiry date (e.g., 1 hour from now)
    const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: passwordResetToken,
        resetPasswordTokenExpiry: passwordResetExpires,
      },
    });

    // Send the email
    await sendPasswordResetEmail(email, resetToken);
    
    return new NextResponse(JSON.stringify({ message: 'If an account with that email exists, a reset link has been sent.' }), { status: 200 });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    return new NextResponse(JSON.stringify({ message: 'Something went wrong' }), { status: 500 });
  }
}

