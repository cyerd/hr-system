// app/api/requests/update/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient, RequestStatus } from '@prisma/client';
import { createNotificationForAdmins } from '@/app/lib/notifications';
import { sendEmail } from '@/app/lib/mailer';
import { generateLeavePdf } from '@/app/lib/pdfGenerator';


const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session || !['ADMIN', 'HR'].includes(session.user?.role)) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
      status: 403,
    });
  }

  try {
    const { id, type, status } = await req.json();

    if (!id || !type || !status) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
      });
    }

    if (!Object.values(RequestStatus).includes(status)) {
        return new NextResponse(JSON.stringify({ message: 'Invalid status value' }), {
            status: 400,
        });
    }

    let updatedRequest;
    let notificationMessage = '';
    let targetUserId = '';

    if (type === 'Leave') {
      const originalRequest = await prisma.leaveRequest.findUnique({ where: { id } });
      if (!originalRequest) {
        return new NextResponse(JSON.stringify({ message: 'Leave request not found' }), { status: 404 });
      }
      targetUserId = originalRequest.userId;

      updatedRequest = await prisma.leaveRequest.update({
        where: { id },
        data: { status },
        include: { user: true }, // Include user data for the email
      });
      notificationMessage = `Your leave request from ${updatedRequest.startDate.toLocaleDateString()} has been ${status.toLowerCase()}.`;

      // --- EMAIL LOGIC ---
      // If the request is approved, generate PDF and send email
      if (status === RequestStatus.APPROVED) {
        const pdfBuffer = await generateLeavePdf(updatedRequest);
        
        await sendEmail({
          to: updatedRequest.user.email,
          subject: 'Leave Request Approved',
          html: `<p>Dear ${updatedRequest.user.name},</p><p>Your leave request has been approved. Please find the official document attached.</p>`,
          attachments: [
            {
              filename: `LeaveApproval_${updatedRequest.id}.pdf`,
              content: pdfBuffer.toString('base64'),
              encoding: 'base64',
            },
          ],
        });
      }

    } else if (type === 'Overtime') {
      const originalRequest = await prisma.overtimeRequest.findUnique({ where: { id } });
       if (!originalRequest) {
        return new NextResponse(JSON.stringify({ message: 'Overtime request not found' }), { status: 404 });
      }
      targetUserId = originalRequest.userId;

      updatedRequest = await prisma.overtimeRequest.update({
        where: { id },
        data: { status },
      });
      notificationMessage = `Your overtime request for ${updatedRequest.date.toLocaleDateString()} has been ${status.toLowerCase()}.`;
    } else {
      return new NextResponse(JSON.stringify({ message: 'Invalid request type' }), {
        status: 400,
      });
    }
    
    // Create a notification for the employee
    if (targetUserId && notificationMessage) {
        await createNotificationForAdmins(notificationMessage, { relatedModel: type === 'Leave' ? 'LeaveRequest' : 'OvertimeRequest', relatedId: id });
    }


    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Something went wrong' }),
      { status: 500 }
    );
  }
}

