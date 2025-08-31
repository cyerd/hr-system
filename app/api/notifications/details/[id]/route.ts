// app/api/notifications/details/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';
import { NotificationWithDetails, SessionUser } from '@/app/lib/types';


const prisma = new PrismaClient();

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!user) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  const { id } = params;

  try {
    // Cast the result to our custom type that includes the optional fields
    const notification = (await prisma.notification.findFirst({
      where: {
        id: id,
        userId: user.id, // Ensure user can only access their own notifications
      },
    })) as NotificationWithDetails | null;

    if (!notification) {
      return new NextResponse(JSON.stringify({ message: 'Notification not found' }), { status: 404 });
    }

    let relatedItem = null;
    if (notification.relatedModel && notification.relatedId) {
      if (notification.relatedModel === 'LeaveRequest') {
        relatedItem = await prisma.leaveRequest.findUnique({
          where: { id: notification.relatedId },
          include: { user: { select: { name: true } } },
        });
      } else if (notification.relatedModel === 'OvertimeRequest') {
        relatedItem = await prisma.overtimeRequest.findUnique({
          where: { id: notification.relatedId },
          include: { user: { select: { name: true } } },
        });
      }
    }

    return NextResponse.json({ notification, relatedItem });
  } catch (error) {
    console.error('Failed to fetch notification details:', error);
    return new NextResponse(JSON.stringify({ message: 'Something went wrong' }), { status: 500 });
  }
}

