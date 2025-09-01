// app/api/profile/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';
import type { SessionUser } from '@/app/lib/types';

const prisma = new PrismaClient();

/**
 * GET handler to fetch the current user's profile details.
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser;

  if (!user?.id) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        email: true,
        role: true,
        gender: true,
        dateOfBirth: true,
        bio: true,
        annualLeaveBalance: true,
        sickLeaveBalance: true,
        maternityLeaveBalance: true,
        paternityLeaveBalance: true,
      },
    });

    if (!userProfile) {
      return new NextResponse(JSON.stringify({ message: 'User not found' }), {
        status: 404,
      });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return new NextResponse(JSON.stringify({ message: 'Something went wrong' }), {
      status: 500,
    });
  }
}

/**
 * PATCH handler to update the user's bio.
 */
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;

    if (!user?.id) {
        return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    try {
        const { bio } = await req.json();

        if (typeof bio !== 'string') {
            return new NextResponse(JSON.stringify({ message: 'Invalid bio format' }), { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { bio },
            select: { bio: true } // Return only the updated bio
        });

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error('Error updating bio:', error);
        return new NextResponse(JSON.stringify({ message: 'Something went wrong' }), { status: 500 });
    }
}
