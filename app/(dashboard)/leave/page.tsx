// app/leave/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Toaster, toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/app/components/users/DataTable";
import { columns } from "@/app/components/requests/MyRequestsColumns";
import { UnifiedRequest } from "@/app/lib/types";


// Define the form schema with Zod
const formSchema = z.object({
  leaveType: z.enum(["ANNUAL", "SICK", "MATERNITY", "PATERNITY", "UNPAID"]),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  reason: z.string().min(10, { message: "Reason must be at least 10 characters." }),
});


// Mock user data - in a real app, this would come from a session/API
const mockUser = {
    gender: 'FEMALE',
    balances: {
        ANNUAL: 21,
        SICK: 10,
        MATERNITY: 90,
        PATERNITY: 0
    }
}

export default function LeavePage() {
  const { data: session } = useSession();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 5),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [isLoading, setIsLoading] = useState(true);
const [requests, setRequests] = useState<UnifiedRequest[]>([]);

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


  async function onSubmit(values: z.infer<typeof formSchema>) {
    const submissionData = {
        leaveType: values.leaveType,
        startDate: values.dateRange.from,
        endDate: values.dateRange.to,
        reason: values.reason
    }

    try {
        const response = await fetch('/api/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to submit request.");
        }
        
        toast.success("Leave request submitted successfully!");
        form.reset();

    } catch (error: any) {
        toast.error(error.message);
    }
  }

  // Filter leave types based on user's gender
  const availableLeaveTypes = [
    { value: "ANNUAL", label: `Annual (${mockUser.balances.ANNUAL} days)` },
    { value: "SICK", label: `Sick (${mockUser.balances.SICK} days)` },
    ...(mockUser.gender === 'FEMALE' ? [{ value: "MATERNITY", label: `Maternity (${mockUser.balances.MATERNITY} days)` }] : []),
    ...(mockUser.gender === 'MALE' ? [{ value: "PATERNITY", label: `Paternity (${mockUser.balances.PATERNITY} days)` }] : []),
    { value: "UNPAID", label: "Unpaid" },
  ];

  return (
    <>
      <Toaster richColors />
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Request Leave</h1>
        <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="leaveType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a leave type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableLeaveTypes.map(lt => (
                            <SelectItem key={lt.value} value={lt.value}>{lt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date Range</FormLabel>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                            date.to ? (
                                <>
                                {format(date.from, "LLL dd, y")} -{" "}
                                {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                            ) : (
                            <span>Pick a date</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={(range) => {
                                setDate(range);
                                if(range) field.onChange(range);
                            }}
                            numberOfMonths={2}
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Please provide a reason for your leave..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full">
                Submit Request
              </Button>
            </form>
          </Form>
        </div>

        <div className="mt-12 ">
            <h2 className="text-2xl font-bold mb-4">My Leave History</h2>

                    <div className="p-6 bg-white rounded-lg shadow-md border max-h-96 overflow-y-auto">
                      {isLoading ? (
                        <p>Loading your requests...</p>
                      ) : (
                        <DataTable columns={columns} data={requests} />
                      )}
                    </div>
                  </div>
            <p className="text-center text-gray-500 p-8 border rounded-lg">History table will be implemented next.</p>
        </div>
    
    </>
  );
}