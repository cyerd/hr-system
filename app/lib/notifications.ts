// app/lib/notifications.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface NotificationOptions {
  relatedModel?: 'LeaveRequest' | 'OvertimeRequest';
  relatedId?: string;
}

/**
 * Creates a notification for all admin and HR users.
 * @param message The notification message.
 * @param options Optional parameters to link the notification to a specific model.
 */
export const createNotificationForAdmins = async (
  message: string,
  options: NotificationOptions = {}
) => {
  try {
    const adminsAndHR = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'ADMIN' },
          { role: 'HR' },
        ],
      },
      select: {
        id: true, // Select only the IDs for efficiency
      },
    });

    if (adminsAndHR.length === 0) {
      console.log("No admin or HR users found to notify.");
      return;
    }

    const notificationData = adminsAndHR.map(user => ({
      userId: user.id,
      message,
      relatedModel: options.relatedModel,
      relatedId: options.relatedId,
    }));

    await prisma.notification.createMany({
      data: notificationData,
    });

    console.log(`Successfully created notifications for ${adminsAndHR.length} admins/HR.`);

  } catch (error) {
    console.error("Failed to create notification for admins:", error);
    // In a real application, you might want to add more robust error handling here.
  }
};

