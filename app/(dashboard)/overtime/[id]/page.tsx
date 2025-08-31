// app/(dashboard)/overtime/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Calendar, FileText, Hourglass } from 'lucide-react';
import { format } from 'date-fns';

// Define a type for the detailed request data
interface OvertimeRequestDetail {
  id: string;
  date: string;
  hours: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function OvertimeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [request, setRequest] = useState<OvertimeRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchRequest = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/overtime/${id}`);
        
        // Read the response body as text first to avoid JSON parsing errors on empty bodies
        const responseText = await response.text();

        if (!response.ok) {
          let errorMessage = `Failed to fetch request details (Status: ${response.status})`;
          // Try to parse the text as JSON for a more specific error message
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // If parsing fails, it means the error response was not JSON.
            // We can use the raw text if it's short, or stick to the generic message.
            if (responseText.length > 0 && responseText.length < 100) {
              errorMessage = responseText;
            }
          }
          throw new Error(errorMessage);
        }

        // If the response is OK and we have text, parse it
        const data = responseText ? JSON.parse(responseText) : null;
        setRequest(data);
        setError(null);

      } catch (err: any) {
        setError(err.message);
        setRequest(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  if (loading) {
    return <div className="p-8">Loading request details...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  if (!request) {
    return <div className="p-8">Request not found.</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Overtime Request Details</h2>
        <Badge
          variant={
            request.status === 'APPROVED' ? 'default' :
            request.status === 'DENIED' ? 'destructive' : 'secondary'
          }
          className="text-lg"
        >
          {request.status}
        </Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Request for {request.user.name}</CardTitle>
          <CardDescription>Submitted on {format(new Date(request.createdAt), 'MMMM dd, yyyy')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <p className="font-semibold">Employee</p>
                <p className="text-gray-700">{request.user.name} ({request.user.email})</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <p className="font-semibold">Date of Overtime</p>
                <p className="text-gray-700">{format(new Date(request.date), 'EEEE, MMMM dd, yyyy')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Hourglass className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <p className="font-semibold">Hours Claimed</p>
                <p className="text-gray-700">{request.hours} hours</p>
              </div>
            </div>
             <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <p className="font-semibold">Status</p>
                <p className="text-gray-700">{request.status}</p>
              </div>
            </div>
          </div>
          <div className="border-t pt-4">
             <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-gray-500 mt-1" />
                <div>
                    <p className="font-semibold">Reason Provided</p>
                    <p className="text-gray-700">{request.reason}</p>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

