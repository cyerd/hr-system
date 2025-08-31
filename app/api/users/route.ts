// src/app/api/users/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  // 1. Secure the endpoint
  const session = await getServerSession(authOptions);

  // @ts-ignore
  if (!session || !['ADMIN', 'HR'].includes(session.user?.role)) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
      status: 403,
    });
  }

  // 2. Fetch the data if authorized
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      // Exclude password field from the result for security
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Something went wrong' }),
      { status: 500 }
    );
  }
}