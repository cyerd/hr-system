// app/api/leave/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';
import { SessionUser } from '@/app/lib/types';


const prisma = new PrismaClient();

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!user) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!leaveRequest) {
      return new NextResponse(JSON.stringify({ message: 'Leave request not found' }), { status: 404 });
    }

    // Security check: Allow access only to the user who made the request or an admin/HR
    if (leaveRequest.userId !== user.id && user.role !== 'ADMIN' && user.role !== 'HR') {
      return new NextResponse(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }

    return NextResponse.json(leaveRequest);
  } catch (error) {
    console.error(`Error fetching leave request ${params.id}:`, error);
    return new NextResponse(JSON.stringify({ message: 'Something went wrong' }), { status: 500 });
  }
}

