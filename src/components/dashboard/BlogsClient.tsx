'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Trash2, Edit, Copy, CheckCircle2, XCircle, Eye, Calendar, MoreVertical, Archive } from 'lucide-react';
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredBlogs = blogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

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
      // Find full post details
      const detailRes = await fetch(`/api/blogs/${blog.slug}`);
      if (!detailRes.ok) throw new Error('Could not load original details');
      const original = await detailRes.json();

      const duplicatedData = {
        ...original,
        _id: undefined, // Let Mongo assign a new ID
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-extrabold tracking-tight">Articles</h1>
          <p className="text-muted-foreground text-sm">Create, publish, edit, and organize insights blogs.</p>
        </div>
        
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center justify-center gap-1 px-4 py-2.5 text-xs font-bold bg-primary text-black hover:bg-primary/95 transition-all rounded-lg shadow-sm"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New Article</span>
        </Link>
      </div>

      {/* Search and Bulk Actions Row */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search articles by title, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-hidden focus:border-primary shadow-xs"
          />
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg p-2.5">
            <span className="text-xs font-bold text-primary px-1.5">
              {selectedIds.length} Selected
            </span>
            <button
              onClick={() => handleBulkAction('publish')}
              disabled={loading}
              className="px-2.5 py-1 text-xs font-bold border border-primary/30 text-primary hover:bg-primary hover:text-black transition-colors rounded-md cursor-pointer"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkAction('unpublish')}
              disabled={loading}
              className="px-2.5 py-1 text-xs font-bold border border-primary/30 text-primary hover:bg-primary hover:text-black transition-colors rounded-md cursor-pointer"
            >
              Draft
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={loading}
              className="px-2.5 py-1 text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors rounded-md cursor-pointer"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Blogs Table Grid */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover/50 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredBlogs.length && filteredBlogs.length > 0}
                    onChange={toggleSelectAll}
                    className="accent-primary rounded h-4 w-4 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredBlogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-surface-hover/20 transition-colors">
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(blog._id)}
                      onChange={() => toggleSelect(blog._id)}
                      className="accent-primary rounded h-4 w-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 flex items-center space-x-3.5 max-w-sm">
                    <div className="h-10 w-16 bg-background rounded-lg overflow-hidden shrink-0 border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={blog.coverImage} alt="" className="object-cover w-full h-full" />
                    </div>
                    <span className="font-bold text-foreground truncate block leading-snug">{blog.title}</span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-primary">{blog.category}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      blog.published
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                    }`}>
                      {blog.published ? <CheckCircle2 className="h-3 w-3" /> : <Archive className="h-3 w-3" />}
                      <span>{blog.published ? 'Published' : 'Draft'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground flex items-center gap-1 py-6">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{blog.views}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap text-xs">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(blog.createdAt)}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <Link
                      href={`/admin/blogs/${blog._id}`}
                      className="p-2 inline-flex border border-border rounded-lg hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit article"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDuplicate(blog)}
                      disabled={loading}
                      className="p-2 border border-border rounded-lg hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Duplicate article"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="p-2 border border-border rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 hover:border-red-500/20 transition-colors cursor-pointer"
                      title="Delete article"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBlogs.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No articles found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
