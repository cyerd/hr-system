// app/(dashboard)/my-requests/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";


import { UnifiedRequest } from "@/app/lib/types";
import { DataTable } from "@/app/components/users/DataTable";
import { columns } from "@/app/components/requests/MyRequestsColumns";


export default function MyRequestsPage() {
  const [requests, setRequests] = useState<UnifiedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/requests/my-history');
        if (!response.ok) {
          throw new Error("Failed to fetch request history.");
        }
        const data = await response.json();
        setRequests(data);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">My Request History</h1>
        <p className="text-gray-600 mb-8">
          Here you can find a complete history of all your leave and overtime requests. For approved leave, you can view and download the official PDF document.
        </p>
        <div className="p-6 bg-white rounded-lg shadow-md border">
          {isLoading ? (
            <p>Loading your requests...</p>
          ) : (
            <DataTable columns={columns} data={requests} />
          )}
        </div>
      </div>
    </>
  );
}
