// app/api/verify/overtime/[id]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = context.params;

    if (!id) {
      return new NextResponse(JSON.stringify({ message: 'Request ID is required' }), {
        status: 400,
      });
    }

    const overtimeRequest = await prisma.overtimeRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!overtimeRequest) {
      return new NextResponse(JSON.stringify({ message: 'Overtime request not found' }), {
        status: 404,
      });
    }

    return NextResponse.json(overtimeRequest);
  } catch (error) {
    console.error('Error fetching overtime request for verification:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Something went wrong' }),
      { status: 500 }
    );
  }
}
