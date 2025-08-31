// app/api/requests/pending/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient, RequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session || !['ADMIN', 'HR'].includes(session.user?.role)) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
      status: 403,
    });
  }

  try {
    const pendingLeave = await prisma.leaveRequest.findMany({
      where: { status: RequestStatus.PENDING },
      include: { user: { select: { name: true } } }, // Include user's name
    });

    const pendingOvertime = await prisma.overtimeRequest.findMany({
      where: { status: RequestStatus.PENDING },
      include: { user: { select: { name: true } } }, // Include user's name
    });

    // Add a 'type' field to distinguish them on the frontend
    const formattedLeave = pendingLeave.map(req => ({ ...req, type: 'Leave' }));
    const formattedOvertime = pendingOvertime.map(req => ({ ...req, type: 'Overtime' }));

    const allRequests = [...formattedLeave, ...formattedOvertime];

    // Sort all requests by creation date, newest first
    allRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(allRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Something went wrong' }),
      { status: 500 }
    );
  }
}