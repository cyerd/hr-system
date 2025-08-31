// app/api/requests/my-history/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';
import { SessionUser } from '@/app/lib/types';


const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!user?.id) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { userId: user.id },
    });

    const overtimeRequests = await prisma.overtimeRequest.findMany({
      where: { userId: user.id },
    });

    // Add a 'type' field to distinguish them on the frontend
    const formattedLeave = leaveRequests.map(req => ({ ...req, type: 'Leave' }));
    const formattedOvertime = overtimeRequests.map(req => ({ ...req, type: 'Overtime' }));

    const allRequests = [...formattedLeave, ...formattedOvertime];

    // Sort all requests by creation date, newest first
    allRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(allRequests);
  } catch (error) {
    console.error('Error fetching user request history:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Something went wrong' }),
      { status: 500 }
    );
  }
}
