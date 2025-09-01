// app/components/layout/Sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, FileText, Clock, Users, UserCog, History, User } from 'lucide-react';
import { SessionUser } from '@/app/lib/types';


const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as SessionUser | undefined;

  const employeeLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/leave', label: 'Leave Request', icon: FileText },
    { href: '/overtime', label: 'Overtime Request', icon: Clock },
    { href: '/my-requests', label: 'My Requests', icon: History },
    { href: '/profile', label: 'My Profile', icon: User },
  ];

  const adminLinks = [
    { href: '/admin/hr/manage-requests', label: 'Manage Requests', icon: UserCog },
    { href: '/admin/hr/manage-users', label: 'Manage Users', icon: Users },
  ];

  const getLinks = () => {
    if (user?.role === 'ADMIN' || user?.role === 'HR') {
      return [...employeeLinks, ...adminLinks];
    }
    return employeeLinks;
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 hidden md:block mr-10">
      <nav>
        <ul>
          {links.map(({ href, label, icon: Icon }) => (
            <li key={href} className="mb-2">
              <Link
                href={href}
                className={`flex items-center p-2 rounded-md transition-colors ${
                  pathname === href
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-700'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
