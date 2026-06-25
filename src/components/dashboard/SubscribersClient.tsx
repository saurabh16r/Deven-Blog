'use client';

import React, { useState } from 'react';
import { Search, Download, Trash2, Calendar, UserCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SubscriberType {
  _id: string;
  email: string;
  subscribedAt: string;
}

interface SubscribersClientProps {
  initialSubscribers: SubscriberType[];
}

export default function SubscribersClient({ initialSubscribers }: SubscribersClientProps) {
  const [subscribers, setSubscribers] = useState<SubscriberType[]>(initialSubscribers);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSubscribers = async (searchVal: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/newsletter?search=${encodeURIComponent(searchVal)}`);
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    fetchSubscribers(val);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return;
    
    try {
      const res = await fetch(`/api/newsletter?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSubscribers(prev => prev.filter(s => s._id !== id));
      }
    } catch (err) {
      console.error('Error deleting subscriber:', err);
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const headers = ['Subscriber ID', 'Email Address', 'Date Subscribed'];
    const rows = subscribers.map(s => [s._id, s.email, new Date(s.subscribedAt).toISOString()]);
    
    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `founderbrief_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-black tracking-tight">Subscribers</h1>
          <p className="text-muted text-xs font-sans font-medium">Manage and download your weekly newsletter list.</p>
        </div>
        
        <button
          onClick={handleExportCSV}
          disabled={subscribers.length === 0}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-primary hover:bg-primary-hover text-primary-foreground transition-all rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Searching Bar */}
      <div className="relative max-w-md w-full">
        <input
          type="text"
          placeholder="Search subscribers..."
          value={search}
          onChange={handleSearchChange}
          className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-hidden focus:border-primary shadow-xs font-sans text-foreground"
        />
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
      </div>

      {/* Grid List View */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="bg-surface/10 border-b border-border text-[10px] font-extrabold uppercase tracking-widest text-muted">
                  <th className="px-6 py-4">Subscriber</th>
                  <th className="px-6 py-4">Date Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {subscribers.map((sub) => (
                  <tr key={sub._id} className="hover:bg-surface/20 transition-colors">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full border border-border text-muted flex items-center justify-center">
                        <UserCheck className="h-4 w-4 stroke-[1.5]" />
                      </div>
                      <span className="font-bold text-foreground">{sub.email}</span>
                    </td>
                    <td className="px-6 py-4 text-muted font-semibold">
                      <span className="flex items-center space-x-1.5 text-xs">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(sub.subscribedAt)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(sub._id)}
                        className="p-1.5 border border-border rounded-md hover:bg-red-500/10 text-muted hover:text-red-500 hover:border-red-500/20 transition-all cursor-pointer"
                        title="Delete subscriber"
                      >
                        <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {subscribers.length === 0 && (
            <div className="text-center py-16 text-muted font-semibold">
              No active subscribers found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
