// prisma/seed.ts

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash a password for the admin user
  const hashedPassword = await bcrypt.hash('AdminPassword123', 10);

  // Create the ADMIN user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      gender: 'MALE', // Or 'FEMALE' as you prefer
      dateOfBirth: new Date('1990-01-01T00:00:00.000Z'),
      role: Role.ADMIN,
      isActive: true, // Admin user should be active by default
      
      // Default leave balances as per the schema
      annualLeaveBalance: 21,
      sickLeaveBalance: 10,
      paternityLeaveBalance: 14,
      maternityLeaveBalance: 0, // Set to 0 for MALE user
    },
  });

  console.log(`✅ Created admin user with email: ${adminUser.email}`);
  console.log('Seeding finished.');
}

// Execute the main function and handle potential errors
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Close the Prisma Client connection
    await prisma.$disconnect();
  });