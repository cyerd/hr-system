// app/(dashboard)/view-notification/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Download, FileText, Clock } from 'lucide-react';
import Link from 'next/link';

// Define types for the fetched data to ensure type safety
interface NotificationDetails {
  notification: {
    id: string;
    message: string;
    createdAt: string;
    relatedModel: string | null;
  };
  relatedItem: any; // Can be LeaveRequest, OvertimeRequest, etc.
}

export default function NotificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [details, setDetails] = useState<NotificationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/notifications/details/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch details.');
        }
        const data = await response.json();
        setDetails(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const renderRelatedItem = () => {
    if (!details?.relatedItem) return null;

    const { relatedItem, notification } = details;
    const isLeave = notification.relatedModel === 'LeaveRequest';
    const isApprovedLeave = isLeave && relatedItem.status === 'APPROVED';

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
          <CardDescription>Details of the request associated with this notification.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Type:</span>
            <span>{isLeave ? 'Leave Request' : 'Overtime Request'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Status:</span>
            <Badge variant={relatedItem.status === 'APPROVED' ? 'default' : relatedItem.status === 'PENDING' ? 'secondary' : 'destructive'}>
              {relatedItem.status}
            </Badge>
          </div>
           <div className="flex justify-between items-center">
            <span className="font-semibold">Applicant:</span>
            <span>{relatedItem.user.name}</span>
          </div>
          <div className="text-sm">
            <p className="font-semibold mb-2">Reason:</p>
            <p className="p-3 bg-gray-50 rounded-md border text-gray-700">{relatedItem.reason}</p>
          </div>
          
          {isApprovedLeave && (
             <Button asChild className="w-full mt-4">
               <Link href={`/api/leave/${relatedItem.id}/download-pdf`} target="_blank">
                 <Download className="mr-2 h-4 w-4" />
                 Download Approved Document
               </Link>
             </Button>
          )}
        </CardContent>
      </Card>
    );
  };


  if (isLoading) return <div className="p-8">Loading notification...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!details) return <div className="p-8">Notification not found.</div>;

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
             <FileText className="h-6 w-6" /> Notification Details
          </CardTitle>
          <CardDescription>{details.notification.message}</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex items-center text-sm text-gray-500 mb-6">
             <Clock className="mr-2 h-4 w-4" />
             <span>Received on {format(new Date(details.notification.createdAt), "PPP p")}</span>
           </div>

          {renderRelatedItem()}

          <Button variant="outline" onClick={() => router.back()} className="w-full mt-6">
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
