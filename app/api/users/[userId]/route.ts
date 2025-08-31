// app/api/users/[userId]/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req: Request, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  // Secure the endpoint
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session || !['ADMIN', 'HR'].includes(session.user?.role)) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
      status: 403,
    });
  }

  try {
    const body = await req.json();
    const { userId } = params;
    const { isActive, role } = body;

    // Validate input: ensure at least one valid field is being updated
    if (typeof isActive !== 'boolean' && !Object.values(Role).includes(role)) {
      return new NextResponse(JSON.stringify({ message: 'Invalid input' }), {
        status: 400,
      });
    }

    const dataToUpdate: { isActive?: boolean; role?: Role } = {};
    if (typeof isActive === 'boolean') {
      dataToUpdate.isActive = isActive;
    }
    if (role) {
      dataToUpdate.role = role;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Something went wrong' }),
      { status: 500 }
    );
  }
}