'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  LayoutDashboard, 
  History, 
  Bookmark, 
  CreditCard, 
  Settings, 
  LogOut 
} from 'lucide-react';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const sidebarLinks = [
    { name: 'Dashboard', href: '/profile', icon: LayoutDashboard },
    { name: 'Reading History', href: '/profile/history', icon: History },
    { name: 'Bookmarks', href: '/profile/bookmarks', icon: Bookmark },
    { name: 'Subscription', href: '/profile/subscription', icon: CreditCard },
    { name: 'Account Settings', href: '/profile/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />
      
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 sm:gap-12">
          
          {/* Left Sidebar Navigation */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="border border-border rounded-lg bg-background p-4.5 space-y-1">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'text-[#6B6258] hover:text-[#1F1A17] hover:bg-surface dark:text-[#D4D4D4] dark:hover:text-[#FAFAF9] dark:hover:bg-surface-hover'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 stroke-[1.5]" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-surface dark:hover:bg-surface-hover transition-all cursor-pointer text-left border-t border-border mt-2 pt-3"
              >
                <LogOut className="h-4.5 w-4.5 stroke-[1.5]" />
                <span>Logout</span>
              </button>
            </div>
          </aside>

          {/* Right Main Content */}
          <main className="lg:col-span-3">
            <div className="border border-border rounded-lg bg-background p-6 sm:p-10 min-h-[480px]">
              {children}
            </div>
          </main>

        </div>
      </div>

      <Footer />
    </div>
  );
}
