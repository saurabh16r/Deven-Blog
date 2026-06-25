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
    <div className="space-y-6 text-sm">
      {/* Header Bar */}
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-black tracking-tight">Categories</h1>
          <p className="text-muted text-xs font-sans font-medium">Add, remove, and review filtering category tabs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Create Form */}
        <div className="lg:col-span-4 bg-background border border-border p-6 rounded-lg space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted flex items-center gap-1.5 border-b border-border pb-3 font-sans select-none">
            <Plus className="h-4 w-4 text-primary" /> Create Category
          </h3>

          <form onSubmit={handleCreate} className="space-y-4 font-sans">
            {errorMsg && (
              <p className="text-xs text-red-600 font-bold bg-red-500/10 p-2.5 border border-red-500/20 rounded-md">
                {errorMsg}
              </p>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Artificial Intelligence"
                required
                className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-hidden focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="artificial-intelligence"
                required
                className="w-full bg-background border border-border rounded-lg px-3 py-2 font-mono text-xs focus:outline-hidden focus:border-primary text-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
            >
              <span>{loading ? 'Creating...' : 'Create Category'}</span>
            </button>
          </form>
        </div>

        {/* Right Side: Category Table */}
        <div className="lg:col-span-8 bg-background border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-surface/30 select-none">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted font-sans">Active Categories</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="bg-surface/10 border-b border-border text-[10px] font-extrabold uppercase tracking-widest text-muted">
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">URL Slug</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-surface/20 transition-colors">
                    <td className="px-6 py-4 flex items-center space-x-2.5 font-bold text-foreground">
                      <Tag className="h-4 w-4 text-primary shrink-0" />
                      <span>{cat.name}</span>
                    </td>
                    <td className="px-6 py-4 text-muted font-mono text-xs">{cat.slug}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-1.5 border border-border rounded-md hover:bg-red-500/10 text-muted hover:text-red-500 hover:border-red-500/20 transition-all cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {categories.length === 0 && (
            <div className="text-center py-16 text-muted flex items-center justify-center flex-col space-y-2 select-none font-sans font-medium">
              <FolderOpen className="h-8 w-8 text-border" />
              <span>No categories found. Create your first category on the left.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
