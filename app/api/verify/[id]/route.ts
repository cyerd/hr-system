// app/api/verify/[id]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This is a public API route, no session check is needed.
export async function GET(req: Request, props: { params: Promise<{ id:string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: {
        id,
        // IMPORTANT: Only approved requests can be verified
        status: 'APPROVED', 
      },
      include: {
        user: {
          select: {
            name: true, // Only select non-sensitive user info
          },
        },
      },
    });

    if (!leaveRequest) {
      return new NextResponse(JSON.stringify({ message: 'Approved leave request not found' }), { status: 404 });
    }

    // Return a subset of data for public verification
    const verificationData = {
      employeeName: leaveRequest.user.name,
      leaveType: leaveRequest.leaveType,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      status: leaveRequest.status,
    };

    return NextResponse.json(verificationData);
  } catch (error) {
    console.error('Verification Error:', error);
    return new NextResponse(JSON.stringify({ message: 'Something went wrong' }), { status: 500 });
  }
}
