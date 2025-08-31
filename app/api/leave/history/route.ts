// app/api/leave/history/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  // @ts-ignore
  if (!session || !session.user?.id) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        // @ts-ignore
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc', // Show the newest requests first
      },
    });

    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave history:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Something went wrong' }),
      { status: 500 }
    );
  }
}
