// app/api/overtime/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';

import { SessionUser } from '@/app/lib/types';
import { createNotificationForAdmins } from '@/app/lib/notifications';



const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!user?.id) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    const body = await req.json();
    const { date, hours, reason } = body;

    // Basic validation
    if (!date || !hours || !reason) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
      });
    }

    const overtimeRequest = await prisma.overtimeRequest.create({
      data: {
        userId: user.id,
        date: new Date(date),
        hours: Number(hours), // Ensure hours is treated as a number
        reason,
      },
    });

    // Create a notification for HR/Admins
    await createNotificationForAdmins(`New overtime request from ${user.name}.`);

    return NextResponse.json(overtimeRequest, { status: 201 });
  } catch (error) {
    console.error('Overtime Request Error:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Something went wrong during the overtime request' }),
      { status: 500 }
    );
  }
}

