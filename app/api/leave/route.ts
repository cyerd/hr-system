// app/api/leave/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient, LeaveType } from '@prisma/client';
import { createNotificationForAdmins } from '@/app/lib/notifications';

const prisma = new PrismaClient();

// Helper to get the correct leave balance field name
const getBalanceField = (leaveType: LeaveType) => {
  const balanceMap = {
    [LeaveType.ANNUAL]: 'annualLeaveBalance',
    [LeaveType.SICK]: 'sickLeaveBalance',
    [LeaveType.MATERNITY]: 'maternityLeaveBalance',
    [LeaveType.PATERNITY]: 'paternityLeaveBalance',
    [LeaveType.UNPAID]: null, // Unpaid leave doesn't have a balance
  };
  return balanceMap[leaveType];
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session || !session.user?.id) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    const body = await req.json();
    const { leaveType, startDate, endDate, reason } = body;

    // --- Validation ---
    if (!leaveType || !startDate || !endDate || !reason) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return new NextResponse(JSON.stringify({ message: 'Start date cannot be after end date' }), {
        status: 400,
      });
    }

    // Calculate the duration of the leave in days
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

    // --- Balance Check ---
    // @ts-ignore
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return new NextResponse(JSON.stringify({ message: 'User not found' }), {
        status: 404,
      });
    }
    
    const balanceField = getBalanceField(leaveType);

    if (balanceField) {
      // @ts-ignore
      const userBalance = user[balanceField];
      if (userBalance < duration) {
        return new NextResponse(JSON.stringify({ message: 'Insufficient leave balance' }), {
          status: 400,
        });
      }

      // --- Deduct from balance ---
      await prisma.user.update({
        // @ts-ignore
        where: { id: session.user.id },
        data: {
          [balanceField]: {
            decrement: duration,
          },
        },
      });
    }

    // --- Create the Leave Request ---
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        // @ts-ignore
        userId: session.user.id,
        leaveType,
        startDate: start,
        endDate: end,
        reason,
        // Status is 'PENDING' by default
      },
    });
      // Notify admins and HR
    // @ts-ignore
    await createNotificationForAdmins(`New leave request submitted by ${session.user.name}.`);
    return NextResponse.json(leaveRequest, { status: 201 });

  } catch (error) {
    console.error('Leave Request Error:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Something went wrong' }),
      { status: 500 }
    );
  }
}