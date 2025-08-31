// app/components/overtime/OvertimeForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Toaster, toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// Define the Zod schema for validation.
const formSchema = z.object({
  date: z.date({
  }).refine((value) => value instanceof Date && !isNaN(value.getTime()), {
    message: "That's not a valid date!", // Handles cases where the input isn't a valid date
}),
  hours: z.number().min(0.5, "Minimum 0.5 hours").max(12, "Maximum 12 hours"),
  reason: z.string().min(10, "Reason must be at least 10 characters.").trim(),
});

// Infer the TypeScript type from the schema
type OvertimeFormValues = z.infer<typeof formSchema>;

interface OvertimeFormProps {
  onSuccess: () => void;
}

export function OvertimeForm({ onSuccess }: OvertimeFormProps) {
  const form = useForm<OvertimeFormValues>({
    resolver: zodResolver(formSchema),
    // IMPORTANT: Default values must match the Zod schema types exactly.
    defaultValues: {
      date: new Date(),
      // hours is a number, not a string. Leave it undefined or set a default number.
      hours: undefined,
      reason: "",
    },
  });

  async function onSubmit(values: OvertimeFormValues) {
    try {
      const response = await fetch('/api/overtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to submit request.");
      
      toast.success("Overtime request submitted successfully!");
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hours Worked</FormLabel>
                <FormControl>
                  {/*
                    KEY FIX: We explicitly handle the conversion between the input's string value
                    and the form's number state.
                  */}
                  <Input
                    type="number"
                    placeholder="e.g., 2.5"
                    step="0.5"
                    {...field}
                    // The value in the input must be a string. Handle undefined/null cases.
                    value={field.value ?? ''}
                    // When the input changes, parse the string value to a float.
                    onChange={(e) => {
                      const value = e.target.value;
                      // Pass either a valid number or null to the form state.
                      field.onChange(value === '' ? null : parseFloat(value));
                    }}
                  />
                </FormControl>
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
                <FormControl><Textarea placeholder="Please provide a reason..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">Submit Request</Button>
        </form>
      </Form>
    </div>
  );
}