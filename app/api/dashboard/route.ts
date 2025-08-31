// app/api/dashboard/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient, RequestStatus } from '@prisma/client';
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
    // --- Data for All Users ---
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        annualLeaveBalance: true,
        sickLeaveBalance: true,
        maternityLeaveBalance: true,
        paternityLeaveBalance: true,
        gender: true,
      },
    });

    const recentLeave = await prisma.leaveRequest.findMany({
      where: { userId: user.id },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });

    const recentOvertime = await prisma.overtimeRequest.findMany({
      where: { userId: user.id },
      take: 2,
      orderBy: { createdAt: 'desc' },
    });
    
    // Add type identifiers before merging
    const typedLeave = recentLeave.map(item => ({...item, requestType: 'Leave'}));
    const typedOvertime = recentOvertime.map(item => ({...item, requestType: 'Overtime'}));

    const recentActivity = [...typedLeave, ...typedOvertime]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
      
    const dashboardData: any = {
      userProfile: userData,
      recentActivity,
    };

    // --- Data for HR/Admins Only ---
    if (['ADMIN', 'HR'].includes(user.role)) {
      const pendingLeaveCount = await prisma.leaveRequest.count({
        where: { status: RequestStatus.PENDING },
      });
      const pendingOvertimeCount = await prisma.overtimeRequest.count({
        where: { status: RequestStatus.PENDING },
      });
      const activeEmployeesCount = await prisma.user.count({
        where: { isActive: true },
      });

      dashboardData.adminStats = {
        pendingRequests: pendingLeaveCount + pendingOvertimeCount,
        activeEmployees: activeEmployeesCount,
      };
    }

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard Data Error:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Something went wrong' }),
      { status: 500 }
    );
  }
}
