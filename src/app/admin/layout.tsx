'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Users,
  Settings,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  PenTool
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Blog Management', href: '/admin/blogs', icon: FileText },
    { name: 'Categories', href: '/admin/categories', icon: FolderKanban },
    { name: 'Authors', href: '/admin/authors', icon: PenTool },
    { name: 'Subscribers', href: '/admin/subscribers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex text-foreground transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Sidebar Header Logo */}
          <div className="flex flex-col py-6 px-6 border-b border-border shrink-0 space-y-1">
            <div className="flex items-center justify-between">
              <Link href="/" className="font-serif font-black text-xl tracking-tight text-foreground select-none">
                Admin Panel
              </Link>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-md hover:bg-surface-hover text-muted"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs uppercase font-extrabold tracking-wider text-muted font-sans select-none">
            Deven Editor
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              // Check if exact match or subpath (excluding root dashboard matching everything)
              const isActive = item.href === '/admin' 
                ? pathname === '/admin' 
                : pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`relative flex items-center space-x-3 px-6 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-surface-hover/60 text-foreground font-bold border-r-[4px] border-primary'
                      : 'text-muted hover:bg-surface-hover/30 hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 stroke-[1.5] ${isActive ? 'text-foreground' : 'text-muted'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls & User profile */}
        <div className="border-t border-border bg-surface shrink-0">
          {/* User profile details from screenshots */}
          <div className="p-4 flex items-center space-x-3 border-b border-border">
            <div className="h-9 w-9 bg-primary text-black rounded-full flex items-center justify-center font-bold font-serif text-xs select-none">
              JD
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">Jane Doe</p>
              <p className="text-[10px] font-extrabold text-muted tracking-wider uppercase truncate">Editor-in-Chief</p>
            </div>
          </div>

          {/* Settings / Site controls */}
          <div className="p-3 space-y-1">
            <Link
              href="/"
              className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-muted hover:text-foreground hover:bg-surface-hover/40 transition-colors"
            >
              <Globe className="h-4 w-4 stroke-[1.5]" />
              <span>Go to Live Site</span>
            </Link>
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-muted select-none">Dark Mode</span>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-md hover:bg-surface-hover/50 border border-border text-foreground transition-colors cursor-pointer"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Mobile Header Bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface lg:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md hover:bg-surface-hover text-muted"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-serif font-black text-base text-foreground select-none">
            Deven Admin
          </span>
          <div className="w-8" /> {/* Spacer */}
        </header>

        {/* Content Body */}
        <div className="flex-grow p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
