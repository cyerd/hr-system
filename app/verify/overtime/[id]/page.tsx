// app/verify/overtime/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { OvertimeRequest, User } from '@prisma/client';

type OvertimeRequestWithUser = OvertimeRequest & { user: Partial<User> };

export default function VerifyOvertimePage() {
  const params = useParams();
  const id = params.id as string;

  const [request, setRequest] = useState<OvertimeRequestWithUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
        setError("No request ID provided.");
        setLoading(false);
        return;
    };

    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/verify/overtime/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to verify document.');
        }

        setRequest(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-8 border-b-2 border-gray-100">
            <h1 className="text-3xl font-bold text-gray-800 text-center">Document Verification</h1>
            <p className="text-center text-gray-500 mt-2">Authenticity check for overtime request document.</p>
        </div>

        <div className="p-8">
          {loading && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              <p className="text-lg font-medium text-gray-600">Verifying document...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <XCircle className="h-16 w-16 text-red-500" />
              <h2 className="text-2xl font-semibold text-red-700">Verification Failed</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          )}

          {request && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-3 text-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h2 className="text-2xl font-semibold text-green-700">Document is Authentic</h2>
                <p className="text-sm text-gray-500">
                  This document has been verified as authentic and matches the details recorded in our system.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-500">Employee Name:</span>
                        <span className="text-gray-800 font-semibold">{request.user.name}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-500">Employee Email:</span>
                        <span className="text-gray-800 font-semibold">{request.user.email}</span>
                    </div>
                     <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-500">Request ID:</span>
                        <span className="text-gray-800 font-mono text-xs">{request.id}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-500">Status:</span>
                        <span className={`font-bold ${
                            request.status === 'APPROVED' ? 'text-green-600' : 
                            request.status === 'DENIED' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                            {request.status}
                        </span>
                    </div>
                     <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-500">Overtime Date:</span>
                        <span className="text-gray-800 font-semibold">{new Date(request.date).toLocaleDateString()}</span>
                    </div>
                     <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-500">Hours Worked:</span>
                        <span className="text-gray-800 font-semibold">{request.hours}</span>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
