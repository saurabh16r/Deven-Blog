'use client';

import React, { useState } from 'react';
import { Plus, Trash2, FolderOpen, Tag } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface CategoryType {
  _id: string;
  name: string;
  slug: string;
}

interface CategoriesClientProps {
  initialCategories: CategoryType[];
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<CategoryType[]>(initialCategories);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(slugify(val));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create category');
      }

      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
      setSlug('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All articles tagged in it will still remain, but the filter will be removed.')) return;

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c._id !== id));
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-extrabold tracking-tight">Categories</h1>
          <p className="text-muted-foreground text-sm">Add, remove, and review filtering category pills.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Create Form */}
        <div className="lg:col-span-4 bg-surface border border-border p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-3">
            <Plus className="h-4.5 w-4.5 text-primary" /> Create Category
          </h3>

          <form onSubmit={handleCreate} className="space-y-4 text-sm">
            {errorMsg && (
              <p className="text-xs text-red-500 font-bold bg-red-500/10 p-2 border border-red-500/20 rounded-md">
                {errorMsg}
              </p>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Artificial Intelligence"
                required
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="artificial-intelligence"
                required
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black font-extrabold text-xs px-4 py-2.5 rounded-lg hover:bg-primary/95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <span>{loading ? 'Creating...' : 'Create Category'}</span>
            </button>
          </form>
        </div>

        {/* Right Side: Category Table */}
        <div className="lg:col-span-8 bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-border bg-surface-hover/30">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-foreground">Active Categories</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-hover/50 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">URL Slug</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-surface-hover/20 transition-colors">
                    <td className="px-6 py-4 flex items-center space-x-2.5 font-bold text-foreground">
                      <Tag className="h-4 w-4 text-primary shrink-0" />
                      <span>{cat.name}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{cat.slug}</td>
                    <td className="px-6 py-4 text-right">
                      {/* Prevent deleting default mock categories */}
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-2 border border-border rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {categories.length === 0 && (
            <div className="text-center py-16 text-muted-foreground flex items-center justify-center flex-col space-y-2">
              <FolderOpen className="h-8 w-8 text-muted" />
              <span>No categories found. Create your first category on the left.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
