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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-extrabold tracking-tight">Subscribers</h1>
          <p className="text-muted-foreground text-sm">Manage and download your weekly insights newsletter list.</p>
        </div>
        
        <button
          onClick={handleExportCSV}
          disabled={subscribers.length === 0}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-primary text-black hover:bg-primary/95 transition-all rounded-lg shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Searching Bar */}
      <div className="relative max-w-md w-full">
        <input
          type="text"
          placeholder="Search subscribers by email address..."
          value={search}
          onChange={handleSearchChange}
          className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-hidden focus:border-primary shadow-xs"
        />
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Grid List View */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-hover/50 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4">Subscriber</th>
                  <th className="px-6 py-4">Date Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {subscribers.map((sub) => (
                  <tr key={sub._id} className="hover:bg-surface-hover/30 transition-colors">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <UserCheck className="h-4.5 w-4.5" />
                      </div>
                      <span className="font-bold text-foreground">{sub.email}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <span className="flex items-center space-x-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(sub.subscribedAt)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(sub._id)}
                        className="p-2 border border-border rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete subscriber"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {subscribers.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              No active subscribers found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
