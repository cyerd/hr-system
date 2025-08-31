// app/api/auth/reset-password/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return new NextResponse(JSON.stringify({ message: 'Missing token or password' }), { status: 400 });
    }

    // 1. Find the user by the unhashed token. We cannot search by the hashed token directly.
    // This is a trade-off for security. We fetch all users with tokens and then compare.
    // In a production app with millions of users, a different strategy might be needed,
    // but this is secure for this scale.
    const usersWithTokens = await prisma.user.findMany({
      where: {
        resetPasswordToken: {
          not: null,
        },
        resetPasswordTokenExpiry: {
          gte: new Date(), // Check if the token is not expired
        },
      },
    });

    let user = null;
    for (const u of usersWithTokens) {
      if (u.resetPasswordToken && await bcrypt.compare(token, u.resetPasswordToken)) {
        user = u;
        break;
      }
    }

    if (!user) {
      return new NextResponse(JSON.stringify({ message: 'Invalid or expired token' }), { status: 400 });
    }

    // 2. Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Update the user's password and clear the reset token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Password has been reset successfully.' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    return new NextResponse(JSON.stringify({ message: 'Something went wrong' }), { status: 500 });
  }
}
