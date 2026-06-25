'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Trash2, Edit, Copy, CheckCircle2, Archive, Calendar, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface BlogType {
  _id: string;
  title: string;
  slug: string;
  coverImage: string;
  category: string;
  views: number;
  published: boolean;
  isTrending: boolean;
  createdAt: string;
}

interface BlogsClientProps {
  initialBlogs: BlogType[];
}

export default function BlogsClient({ initialBlogs }: BlogsClientProps) {
  const [blogs, setBlogs] = useState<BlogType[]>(initialBlogs);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredBlogs = blogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'published') return matchesSearch && b.published;
    if (statusFilter === 'draft') return matchesSearch && !b.published;
    return matchesSearch;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBlogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBlogs.map(b => b._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedIds.length} articles?`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: selectedIds })
      });
      if (res.ok) {
        if (action === 'publish') {
          setBlogs(prev => prev.map(b => selectedIds.includes(b._id) ? { ...b, published: true } : b));
        } else if (action === 'unpublish') {
          setBlogs(prev => prev.map(b => selectedIds.includes(b._id) ? { ...b, published: false } : b));
        } else if (action === 'delete') {
          setBlogs(prev => prev.filter(b => !selectedIds.includes(b._id)));
        }
        setSelectedIds([]);
      }
    } catch (err) {
      console.error('Bulk action failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const res = await fetch(`/api/admin/blogs?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setBlogs(prev => prev.filter(b => b._id !== id));
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleDuplicate = async (blog: BlogType) => {
    setLoading(true);
    try {
      const detailRes = await fetch(`/api/blogs/${blog.slug}`);
      if (!detailRes.ok) throw new Error('Could not load original details');
      const original = await detailRes.json();

      const duplicatedData = {
        ...original,
        _id: undefined,
        title: `${original.title} (Copy)`,
        slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
        published: false,
        isTrending: false,
        trendingRank: 0,
        views: 0,
        createdAt: undefined,
        updatedAt: undefined
      };

      const createRes = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatedData)
      });
      
      if (createRes.ok) {
        const newBlog = await createRes.json();
        setBlogs(prev => [newBlog, ...prev]);
      }
    } catch (err) {
      console.error('Duplicate failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-serif font-black tracking-tight">Blog Articles</h1>
          <span className="text-xs uppercase font-extrabold tracking-wider bg-surface border border-border px-2.5 py-1 rounded text-muted font-sans select-none">
            {blogs.length} Total
          </span>
        </div>
        
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-primary hover:bg-primary-hover text-primary-foreground transition-all rounded-lg cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Article</span>
        </Link>
      </div>

      {/* Search and Bulk Actions Row */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-1 max-w-lg items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-hidden focus:border-primary shadow-xs font-sans text-foreground"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-background border border-border text-foreground text-sm rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:border-primary font-bold font-sans cursor-pointer shrink-0"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-[#F4EDE2] dark:bg-[#1A1614] border border-border rounded-lg p-2">
            <span className="text-xs font-bold text-muted px-2">
              {selectedIds.length} Selected
            </span>
            <button
              onClick={() => handleBulkAction('publish')}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-bold border border-border text-foreground hover:bg-background transition-colors rounded-md cursor-pointer"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkAction('unpublish')}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-bold border border-border text-foreground hover:bg-background transition-colors rounded-md cursor-pointer"
            >
              Draft
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors rounded-md cursor-pointer"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Blogs Table Grid */}
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-surface/45 border-b border-border text-[10px] font-extrabold uppercase tracking-widest text-muted">
                <th className="p-4 w-12 text-center select-none">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredBlogs.length && filteredBlogs.length > 0}
                    onChange={toggleSelectAll}
                    className="accent-primary rounded h-4 w-4 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">Article Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Published Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredBlogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-surface/20 transition-colors">
                  <td className="p-4 text-center select-none">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(blog._id)}
                      onChange={() => toggleSelect(blog._id)}
                      className="accent-primary rounded h-4 w-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <div className="space-y-0.5">
                      <span className="font-serif font-black text-base text-foreground leading-snug block">
                        {blog.title}
                      </span>
                      <span className="text-xs font-semibold text-muted font-sans uppercase tracking-wider block">
                        {blog.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="flex items-center gap-2 font-bold text-xs">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        blog.published ? 'bg-success' : 'bg-muted'
                      }`} />
                      <span className={blog.published ? 'text-success' : 'text-muted'}>
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted text-xs font-semibold whitespace-nowrap">
                    {blog.published ? formatDate(blog.createdAt) : '—'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <Link
                      href={`/admin/blogs/${blog._id}`}
                      className="p-1.5 inline-flex border border-border rounded-md hover:bg-surface text-muted hover:text-foreground transition-all"
                      title="Edit article"
                    >
                      <Edit className="h-3.5 w-3.5 stroke-[1.5]" />
                    </Link>
                    <button
                      onClick={() => handleDuplicate(blog)}
                      disabled={loading}
                      className="p-1.5 border border-border rounded-md hover:bg-surface text-muted hover:text-foreground transition-all cursor-pointer"
                      title="Duplicate article"
                    >
                      <Copy className="h-3.5 w-3.5 stroke-[1.5]" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="p-1.5 border border-border rounded-md hover:bg-red-500/10 text-muted hover:text-red-500 hover:border-red-500/20 transition-all cursor-pointer"
                      title="Delete article"
                    >
                      <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBlogs.length === 0 && (
          <div className="text-center py-16 text-muted font-semibold">
            No articles found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
