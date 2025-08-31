// app/verify/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface VerificationData {
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function VerificationPage() {
  const { id } = useParams();
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const verifyRequest = async () => {
        try {
          const response = await fetch(`/api/verify/${id}`);
          if (!response.ok) {
            throw new Error('This document is not valid or the request was not approved.');
          }
          const result = await response.json();
          setData(result);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      verifyRequest();
    }
  }, [id]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <main className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg border text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Document Verification</h1>
        
        {loading && (
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="mt-4 text-lg text-gray-600">Verifying document...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
            <XCircle className="h-16 w-16 text-red-500" />
            <p className="mt-4 text-xl font-semibold text-red-700">Verification Failed</p>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        )}

        {data && (
          <div className="flex flex-col items-center justify-center p-8 bg-green-50 rounded-lg">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <p className="mt-4 text-xl font-semibold text-green-800">Document is Authentic</p>
            <div className="text-left mt-6 w-full space-y-4">
              <div className="p-4 border rounded-md">
                <p className="font-semibold text-gray-700">Employee Name:</p>
                <p className="text-lg text-gray-900">{data.employeeName}</p>
              </div>
              <div className="p-4 border rounded-md">
                <p className="font-semibold text-gray-700">Leave Type:</p>
                <p className="text-lg text-gray-900">{data.leaveType}</p>
              </div>
              <div className="p-4 border rounded-md">
                <p className="font-semibold text-gray-700">Approved Dates:</p>
                <p className="text-lg text-gray-900">
                  {format(new Date(data.startDate), 'PPP')} to {format(new Date(data.endDate), 'PPP')}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
