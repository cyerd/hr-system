// app/(dashboard)/leave/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LeaveRequest, User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

type LeaveRequestWithUser = LeaveRequest & { user: User };

export default function LeaveRequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<LeaveRequestWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchRequest = async () => {
        try {
          // This API route needs to be created
          const response = await fetch(`/api/leave/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch leave request details.');
          }
          const data = await response.json();
          setRequest(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchRequest();
    }
  }, [id]);

  const handleDownload = () => {
    window.open(`/api/leave/${id}/download-pdf`, '_blank');
  };

  if (loading) return <p>Loading request details...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!request) return <p>Leave request not found.</p>;

  const statusVariant: "default" | "secondary" | "destructive" =
    request.status === "APPROVED" ? "default" : request.status === "PENDING" ? "secondary" : "destructive";

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
      </Button>
      <div className="bg-white p-8 rounded-lg shadow-md border max-w-4xl mx-auto">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold">Leave Request Details</h1>
          <Badge variant={statusVariant} className="text-lg">{request.status}</Badge>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><p className="font-semibold">Employee Name:</p><p>{request.user.name}</p></div>
          <div><p className="font-semibold">Leave Type:</p><p>{request.leaveType}</p></div>
          <div><p className="font-semibold">Start Date:</p><p>{format(new Date(request.startDate), 'PPP')}</p></div>
          <div><p className="font-semibold">End Date:</p><p>{format(new Date(request.endDate), 'PPP')}</p></div>
        </div>
        <div className="mt-6">
          <p className="font-semibold">Reason:</p>
          <p className="mt-1 p-4 bg-gray-50 rounded-md border">{request.reason}</p>
        </div>

        {request.status === 'APPROVED' && (
          <div className="mt-8 text-center">
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download as PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
