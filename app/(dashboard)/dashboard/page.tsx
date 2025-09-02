// app/(dashboard)/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Briefcase, Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { SessionUser } from '../../lib/types';


// Define types for the dashboard data
interface UserProfile {
  annualLeaveBalance: number;
  sickLeaveBalance: number;
  maternityLeaveBalance: number;
  paternityLeaveBalance: number;
  gender: 'MALE' | 'FEMALE';
}

interface AdminStats {
  pendingRequests: number;
  activeEmployees: number;
}

interface RecentActivityItem {
  id: string;
  status: string;
  createdAt: string;
  requestType: 'Leave' | 'Overtime';
  // Leave-specific
  leaveType?: string;
  // Overtime-specific
  hours?: number;
}

interface DashboardData {
  userProfile: UserProfile;
  recentActivity: RecentActivityItem[];
  adminStats?: AdminStats;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as SessionUser | undefined;

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Africa/Nairobi',
    };
    setCurrentDate(new Intl.DateTimeFormat('en-KE', options).format(date));

    const fetchData = async () => {
      if (session) {
        setLoading(true);
        try {
          const response = await fetch('/api/dashboard');
          if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
          }
          const data = await response.json();
          setDashboardData(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground">{currentDate}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/leave">
            <Button>Request Leave</Button>
          </Link>
          <Link href="/overtime">
            <Button variant="secondary">Request Overtime</Button>
          </Link>
        </div>
      </div>

      {/* Admin & HR Stats */}
      {dashboardData?.adminStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.adminStats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Awaiting your approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.adminStats.activeEmployees}</div>
              <p className="text-xs text-muted-foreground">Currently in the system</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Employee Leave Balances */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Leave</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.userProfile?.annualLeaveBalance} Days</div>
            <p className="text-xs text-muted-foreground">Remaining for the year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sick Leave</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.userProfile?.sickLeaveBalance} Days</div>
            <p className="text-xs text-muted-foreground">Remaining for the year</p>
          </CardContent>
        </Card>
        {dashboardData?.userProfile?.gender === 'FEMALE' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maternity Leave</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.userProfile?.maternityLeaveBalance} Days</div>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </CardContent>
          </Card>
        )}
        {dashboardData?.userProfile?.gender === 'MALE' && (
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paternity Leave</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.userProfile?.paternityLeaveBalance} Days</div>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData?.recentActivity?.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent activity to display.</p>
            )}
            {dashboardData?.recentActivity?.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-full mr-4">
                    {item.requestType === 'Leave' ? <Calendar className="h-5 w-5 text-gray-600"/> : <Clock className="h-5 w-5 text-gray-600" />}
                  </div>
                  <div>
                    <p className="font-medium capitalize">
                      {item.requestType === 'Leave' ? `${item.leaveType?.toLowerCase().replace('_', ' ')} Leave` : `${item.hours} Hours Overtime`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted on {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <Badge variant={
                  item.status === 'APPROVED' ? 'default' :
                  item.status === 'DENIED' ? 'destructive' : 'secondary'
                }>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
