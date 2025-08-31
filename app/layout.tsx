// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider"; // Import the provider
import Sidebar from "./components/layout/Sidebar";
import { Navbar } from "./components/layout/Navbar";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HR Management System",
  description: "Avopro EPZ Limited HR System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> {/* Wrap the children */}
          <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1">
              <Navbar />
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}