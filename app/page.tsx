// app/page.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Briefcase, Calendar, Clock, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-gray-900">
                    Streamline Your Human Resources Management
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Our platform simplifies leave requests, overtime tracking, and employee management, allowing you to focus on what matters most: your people.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button size="lg">Employee Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" variant="secondary">
                      Create an Account
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center">
                 {/* You can place an illustration or image here */}
                 <Briefcase className="h-48 w-48 text-gray-200" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-600">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything You Need in One Place
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Manage the entire employee lifecycle with our intuitive and powerful tools.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              <div className="grid gap-1 text-center p-6 bg-white rounded-lg shadow">
                <Calendar className="h-8 w-8 mx-auto text-blue-600" />
                <h3 className="text-lg font-bold">Leave Management</h3>
                <p className="text-sm text-gray-500">
                  Employees can easily request leave, and managers can approve with a single click.
                </p>
              </div>
              <div className="grid gap-1 text-center p-6 bg-white rounded-lg shadow">
                <Clock className="h-8 w-8 mx-auto text-blue-600" />
                <h3 className="text-lg font-bold">Overtime Tracking</h3>
                <p className="text-sm text-gray-500">
                  Submit and manage overtime requests with a clear, auditable trail.
                </p>
              </div>
              <div className="grid gap-1 text-center p-6 bg-white rounded-lg shadow">
                <Users className="h-8 w-8 mx-auto text-blue-600" />
                <h3 className="text-lg font-bold">User Management</h3>
                <p className="text-sm text-gray-500">
                  Admins can easily manage employee roles, access, and account status.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} AVOPRO EPZ LIMITED. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
