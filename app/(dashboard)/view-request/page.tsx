// app/(dashboard)/view-request/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileDown, Calendar, Clock, User } from 'lucide-react';
import { LeaveRequest, OvertimeRequest } from '@prisma/client';
import { Toaster, toast } from 'sonner';

// Define a type for a request that includes the user's name
type RequestWithUser = (LeaveRequest | OvertimeRequest) & {
  user: { name: string };
};

// Main component wrapped in Suspense for useSearchParams
function ViewRequestComponent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const type = searchParams.get('type'); // 'leave' or 'overtime'

  const [request, setRequest] = useState<RequestWithUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !type) {
      setError("Request ID or type is missing.");
      setIsLoading(false);
      return;
    }

    const fetchRequestDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = type === 'leave' ? `/api/leave/${id}` : `/api/overtime/${id}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch ${type} request details.`);
        }
        const data = await response.json();
        setRequest(data);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id, type]);

  const renderRequestDetails = () => {
    if (!request) return null;

    const isLeave = type === 'leave';
    const leaveRequest = isLeave ? (request as LeaveRequest & { user: { name: string } }) : null;
    const overtimeRequest = !isLeave ? (request as OvertimeRequest & { user: { name: string } }) : null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Employee</p>
              <p className="font-medium">{request.user.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Date Submitted</p>
              <p className="font-medium">{new Date(request.createdAt).toLocaleDateString('en-KE')}</p>
            </div>
          </div>
        </div>

        {isLeave && leaveRequest && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">Start Date:</p>
              <p className="font-medium">{new Date(leaveRequest.startDate).toLocaleDateString('en-KE')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">End Date:</p>
              <p className="font-medium">{new Date(leaveRequest.endDate).toLocaleDateString('en-KE')}</p>
            </div>
          </div>
        )}

        {!isLeave && overtimeRequest && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">Overtime Date:</p>
              <p className="font-medium">{new Date(overtimeRequest.date).toLocaleDateString('en-KE')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Hours</p>
                <p className="font-medium">{overtimeRequest.hours}</p>
              </div>
            </div>
          </div>
        )}
        
        <div>
          <p className="text-sm text-muted-foreground">Reason</p>
          <p className="font-medium p-3 bg-muted rounded-md">{request.reason}</p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading request details...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Toaster richColors />
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                {type === 'leave' ? 'Leave' : 'Overtime'} Request Details
              </CardTitle>
              <CardDescription>
                Review the details of the request submitted by {request?.user.name}.
              </CardDescription>
            </div>
            <Badge variant={request?.status === 'APPROVED' ? 'default' : request?.status === 'DENIED' ? 'destructive' : 'secondary'}>
              {request?.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {renderRequestDetails()}
          {type === 'leave' && request?.status === 'APPROVED' && (
            <div className="mt-6 text-center">
              <Button asChild>
                <Link href={`/api/leave/${request.id}/download-pdf`} target="_blank">
                  <FileDown className="mr-2 h-4 w-4" />
                  Download Approved PDF
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Export a default component that includes the Suspense wrapper
export default function ViewRequestPage() {
  return (
    <Suspense fallback={<div>Loading Page...</div>}>
      <ViewRequestComponent />
    </Suspense>
  );
}
