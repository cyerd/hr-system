// app/api/register/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createNotificationForAdmins } from '@/app/lib/notifications';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, gender, dateOfBirth } = body;

    // 1. Validate input
    if (!name || !email || !password || !gender || !dateOfBirth) {
      return new NextResponse(JSON.stringify({ message: 'All fields are required' }), {
        status: 400,
      });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new NextResponse(JSON.stringify({ message: 'Email already in use' }), {
        status: 409, // Conflict
      });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Apply gender-based leave balance logic
    let leaveBalances = {};
    if (gender === 'MALE') {
      leaveBalances = { maternityLeaveBalance: 0 };
    } else if (gender === 'FEMALE') {
      leaveBalances = { paternityLeaveBalance: 0 };
    }

    // 5. Create the new user (as inactive)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        ...leaveBalances,
        // isActive is false by default
      },
    });
      // Notify admins and HR about the new registration
    await createNotificationForAdmins(`New user registered: ${newUser.name} (${newUser.email}). Account requires activation.`);

    return NextResponse.json(
      { message: 'User registered successfully. Awaiting activation.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration Error:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Something went wrong' }),
      { status: 500 }
    );
  }
}