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
  Image as ImageIcon,
  Settings,
  Menu,
  X,
  Globe,
  Sun,
  Moon
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Blogs', href: '/admin/blogs', icon: FileText },
    { name: 'Categories', href: '/admin/categories', icon: FolderKanban },
    { name: 'Subscribers', href: '/admin/subscribers', icon: Users },
    { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
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
          <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <span className="h-7 w-7 rounded-lg bg-primary text-black flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                D
              </span>
              <span className="font-sans font-extrabold text-lg tracking-tight">
                Deven<span className="text-primary font-bold">.</span>
              </span>
              <span className="text-[9px] font-extrabold bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded-sm uppercase tracking-wider ml-1 shrink-0">
                Admin
              </span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-md hover:bg-surface-hover text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-black shadow-xs font-bold'
                      : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-black' : 'text-muted-foreground'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-border bg-surface-hover/30 space-y-2">
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span>Go to Live Site</span>
          </Link>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs text-muted-foreground">Dark Theme</span>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full hover:bg-surface border border-border text-foreground transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Mobile Header Bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface lg:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md hover:bg-surface-hover text-muted-foreground"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-sans font-extrabold text-sm tracking-tight text-foreground">
            Deven Admin Portal
          </span>
          <div className="w-8" /> {/* Spacer */}
        </header>

        {/* Content Body Router */}
        <div className="flex-grow p-6 sm:p-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
