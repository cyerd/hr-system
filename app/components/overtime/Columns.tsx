// app/components/overtime/Columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { OvertimeRequest } from "@prisma/client";

export type OvertimeHistory = OvertimeRequest;

export const columns: ColumnDef<OvertimeHistory>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return <span>{format(new Date(row.getValue("date")), "MMM dd, yyyy")}</span>;
    },
  },
  {
    accessorKey: "hours",
    header: "Hours Worked",
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
      cell: ({ row }) => {
        const reason = row.getValue("reason") as string;
        return <span className="truncate">{reason.substring(0, 40)}...</span>
      }
  }
];