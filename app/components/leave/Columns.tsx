// app/components/leave/Columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { LeaveRequest } from "@prisma/client"; // Import the type directly

// Define the shape of our data, which is a LeaveRequest
export type LeaveHistory = LeaveRequest;

export const columns: ColumnDef<LeaveHistory>[] = [
  {
    accessorKey: "leaveType",
    header: "Leave Type",
    cell: ({ row }) => {
      const type = row.getValue("leaveType") as string;
      // Capitalize first letter for display
      return <span>{type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}</span>;
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      return <span>{format(new Date(row.getValue("startDate")), "MMM dd, yyyy")}</span>;
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      return <span>{format(new Date(row.getValue("endDate")), "MMM dd, yyyy")}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant: "default" | "secondary" | "destructive" =
        status === "APPROVED"
          ? "default"
          : status === "PENDING"
          ? "secondary"
          : "destructive";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
      accessorKey: 'reason',
      header: 'Reason',
      // Optionally truncate long reasons
      cell: ({ row }) => {
        const reason = row.getValue("reason") as string;
        return <span className="truncate">{reason.substring(0, 30)}...</span>
      }
  }
];