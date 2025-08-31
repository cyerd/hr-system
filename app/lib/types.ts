// app/lib/types.ts

import { LeaveRequest, OvertimeRequest, User, Role, RequestStatus, Notification } from '@prisma/client';

/**
 * Represents the structure of the user object within the NextAuth session JWT.
 * This extends the default user type to include our custom fields like id and role.
 */
export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
}

/**
 * Represents the combined data of a LeaveRequest and its associated User.
 * We use Pick to only include the user fields we actually need.
 */
export type LeaveRequestWithUser = LeaveRequest & {
  user: User;
};

/**
 * Represents the combined data of an OvertimeRequest and its associated User.
 */
export type OvertimeRequestWithUser = OvertimeRequest & {
    user: Pick<User, 'id' | 'name' | 'email'>;
};


/**
 * A union type that can represent either a leave or overtime request,
 * formatted for the unified admin dashboard.
 */
export type UnifiedRequest = (LeaveRequestWithUser & { type: 'Leave' }) | (OvertimeRequestWithUser & { type: 'Overtime' });


export type NotificationWithDetails = Notification & {
  relatedModel?: string | null;
  relatedId?: string | null;
};