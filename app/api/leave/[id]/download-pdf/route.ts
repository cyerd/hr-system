// app/api/leave/[id]/download-pdf/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { generateLeavePdf } from '@/app/lib/pdfGenerator';
import { LeaveRequestWithUser, SessionUser } from '@/app/lib/types';


const prisma = new PrismaClient();

// This is the correct function signature for a dynamic route in the App Router.
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) {
      return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    const leaveRequestId = params.id;
    if (!leaveRequestId) {
        return new NextResponse(JSON.stringify({ message: 'Leave request ID is missing' }), { status: 400 });
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            gender: true,
            dateOfBirth: true,
            bio: true,
            isActive: true,
            role: true,
            resetPasswordToken: true,
            resetPasswordTokenExpiry: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      return new NextResponse(JSON.stringify({ message: 'Leave request not found' }), { status: 404 });
    }

    // Security check
    if (leaveRequest.userId !== user.id && !['ADMIN', 'HR'].includes(user.role)) {
       return new NextResponse(JSON.stringify({ message: 'Access Denied' }), { status: 403 });
    }
    
    const pdfBuffer = await generateLeavePdf(leaveRequest as LeaveRequestWithUser);

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="leave-request-${leaveRequest.id}.pdf"`);

    return new NextResponse(Buffer.from(pdfBuffer), { status: 200, headers });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Error generating PDF for leave request ${params.id}:`, errorMessage);
    return new NextResponse(
      JSON.stringify({ message: 'Failed to generate PDF' }),
      { status: 500 }
    );
  }
}

