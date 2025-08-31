"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Toaster, toast } from "sonner";

import { getColumns, UnifiedRequest } from "@/components/requests/Columns";
import { DataTable } from "@/app/components/users/DataTable";

export default function ManageRequestsPage() {
  const [requests, setRequests] = useState<UnifiedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/requests/pending');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch requests.");
      }
      setRequests(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  // useMemo ensures that the columns array is not recreated on every render,
  // unless the fetchPendingRequests function changes.
  const columns = useMemo(() => getColumns(fetchPendingRequests), [fetchPendingRequests]);

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Manage Pending Requests</h1>
        <div className="p-6 bg-white rounded-lg shadow-md border">
          {isLoading ? (
            <p>Loading pending requests...</p>
          ) : (
            <DataTable columns={columns} data={requests} />
          )}
        </div>
      </div>
    </>
  );
}
