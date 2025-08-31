"use client";

import { useState, useEffect, useCallback } from "react";

import { toast, Toaster } from "sonner";
import { columns, OvertimeHistory } from "../../components/overtime/Columns";
import { OvertimeForm } from "../../components/overtime/OvertimeForm";
import { DataTable } from "../../components/users/DataTable";

export default function OvertimePage() {
  const [history, setHistory] = useState<OvertimeHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    // Set loading to true at the start of the fetch
    setIsLoading(true);
    try {
      const response = await fetch('/api/overtime/history');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch history.");
      }
      
      setHistory(data);
    } catch (error: any) {
      toast.error(error.message || "Could not load overtime history.");
      setHistory([]); // Reset to empty array on error
    } finally {
      // Always set loading to false at the end
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="container mx-auto py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h1 className="text-3xl font-bold mb-6">Request Overtime</h1>
            {/* The form component is now self-contained */}
            <OvertimeForm onSuccess={fetchHistory} />
          </div>
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-6">My Overtime History</h2>
            <div className="p-6 bg-white rounded-lg shadow-md border">
              {isLoading ? (
                <div className="flex justify-center items-center h-24">
                  <p>Loading history...</p>
                </div>
              ) : (
                <DataTable columns={columns} data={history} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
