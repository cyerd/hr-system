"use client";

import { type ColumnDef, type CellContext } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

// This is a custom type that merges properties from both request types
export type UnifiedRequest = {
  id: string;
  type: "Leave" | "Overtime";
  status: "PENDING" | "APPROVED" | "DENIED";
  createdAt: string;
  user: {
    name: string;
  };
  // Leave-specific
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  // Overtime-specific
  date?: string;
  hours?: number;
};

// Use the specific type from TanStack Table for better type safety
type ActionsCellContext = CellContext<UnifiedRequest, unknown>;

// Helper component for the action buttons with stricter typing
const ActionsCell: React.FC<{ row: ActionsCellContext['row'], onUpdate: () => void }> = ({ row, onUpdate }) => {
  const request = row.original; // `original` is now correctly typed as UnifiedRequest

  const handleAction = async (newStatus: "APPROVED" | "DENIED") => {
    try {
      const response = await fetch('/api/requests/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: request.id,
          type: request.type,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status.");
      }
      
      // Call the passed-in function to trigger a data refresh
      onUpdate();

    } catch (error) {
      console.error("Update failed:", error);
      // Here you would show a toast notification
    }
  };

  return (
    <div className="space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAction("APPROVED")}
      >
        Approve
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => handleAction("DENIED")}
      >
        Deny
      </Button>
    </div>
  );
};


// Main column definitions, now including the onUpdate prop
export const getColumns = (onUpdate: () => void): ColumnDef<UnifiedRequest>[] => [
  {
    accessorKey: "user.name",
    header: "Employee",
  },
  {
    accessorKey: "type",
    header: "Request Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const variant = type === "Leave" ? "default" : "secondary";
      return <Badge variant={variant}>{type}</Badge>;
    },
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => {
      const req = row.original;
      // KEY FIX: Add checks to ensure dates exist before formatting
      if (req.type === "Leave" && req.startDate && req.endDate) {
        return `Type: ${req.leaveType} (${format(new Date(req.startDate), "MMM d")} - ${format(new Date(req.endDate), "MMM d")})`;
      }
      if (req.type === "Overtime" && req.date) {
        return `${req.hours} hours on ${format(new Date(req.date), "MMM d, yyyy")}`;
      }
      // Provide a fallback for incomplete data
      return "Details unavailable";
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Submitted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <span>{format(new Date(row.getValue("createdAt")), "MMM dd, yyyy")}</span>;
    },
  },
  {
    id: "actions",
    // Destructure `row` directly from the context and pass it to the ActionsCell component
    cell: ({ row }) => <ActionsCell row={row} onUpdate={onUpdate} />,
  },
];

