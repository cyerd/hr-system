// app/components/requests/MyRequestsColumns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { UnifiedRequest } from "@/app/lib/types";


export const columns: ColumnDef<UnifiedRequest>[] = [
  {
    accessorKey: "type",
    header: "Request Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const variant = type === 'Leave' ? 'default' : 'secondary';
      return <Badge variant={variant}>{type}</Badge>;
    }
  },
  {
    header: "Date / Range",
    cell: ({ row }) => {
      const request = row.original;
      if (request.type === 'Leave' && 'startDate' in request && 'endDate' in request) {
        return (
          <span>
            {format(new Date(request.startDate), "MMM dd, yyyy")} - {format(new Date(request.endDate), "MMM dd, yyyy")}
          </span>
        );
      }
      if (request.type === 'Overtime' && 'date' in request) {
        return <span>{format(new Date(request.date), "MMM dd, yyyy")}</span>;
      }
      return null;
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
    id: 'actions',
    header: 'Document',
    cell: ({ row }) => {
      const request = row.original;
      const isApproved = request.status === 'APPROVED';
      
      // Only show the button for approved leave requests, as they have a PDF
      if (isApproved && request.type === 'Leave') {
        return (
          <Button asChild variant="outline" size="sm">
            <Link href={`/leave/${request.id}`}>
              View / Download <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        );
      }
      // For other statuses or types, show a placeholder or nothing
      return <span className="text-xs text-gray-400">Not applicable</span>;
    }
  }
];
