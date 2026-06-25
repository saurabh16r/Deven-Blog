'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TiptapEditor from './TiptapEditor';
import { slugify, calculateReadingTime } from '@/lib/utils';
import { Save, Sparkles, Headphones, Upload, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface BlogType {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  
  featured: boolean;
  published: boolean;
  
  isTrending: boolean;
  trendingRank: number;
  featuredTrending: boolean;
  
  views?: number;
  readingTime: number;
  
  aiSummaryEnabled: boolean;
  audioEnabled: boolean;
  
  aiSummary: string;
  audioUrl: string;
  
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
}

interface CategoryType {
  _id: string;
  name: string;
  slug: string;
}

interface BlogEditFormProps {
  blog?: BlogType;
  categories: CategoryType[];
}

export default function BlogEditForm({ blog, categories }: BlogEditFormProps) {
  const router = useRouter();
  const isEdit = !!blog;

  // Form State
  const [formData, setFormData] = useState<BlogType>({
    title: blog?.title || '',
    slug: blog?.slug || '',
    excerpt: blog?.excerpt || '',
    content: blog?.content || '',
    coverImage: blog?.coverImage || '',
    category: blog?.category || categories[0]?.name || 'Startups',
    tags: blog?.tags || [],
    featured: blog?.featured || false,
    published: blog?.published || false,
    isTrending: blog?.isTrending || false,
    trendingRank: blog?.trendingRank || 0,
    featuredTrending: blog?.featuredTrending || false,
    readingTime: blog?.readingTime || 5,
    aiSummaryEnabled: blog?.aiSummaryEnabled !== undefined ? blog?.aiSummaryEnabled : true,
    audioEnabled: blog?.audioEnabled !== undefined ? blog?.audioEnabled : false,
    aiSummary: blog?.aiSummary || '',
    audioUrl: blog?.audioUrl || '',
    seoTitle: blog?.seoTitle || '',
    seoDescription: blog?.seoDescription || '',
    ogImage: blog?.ogImage || ''
  });

  const [tagInput, setTagInput] = useState(blog?.tags.join(', ') || '');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Title auto-slugification
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => {
      const next: any = { ...prev, title: val };
      if (!isEdit) {
        next.slug = slugify(val);
        next.seoTitle = `${val} - FounderBrief`;
      }
      return next;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (field: keyof BlogType) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] } as any));
  };

  // Convert Tag inputs comma array
  useEffect(() => {
    const list = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    setFormData(prev => ({ ...prev, tags: list }));
  }, [tagInput]);

  // Sync Reading Time dynamically based on editor content updates
  const handleContentChange = (html: string) => {
    setFormData(prev => ({
      ...prev,
      content: html,
      readingTime: calculateReadingTime(html)
    }));
  };

  // Image Upload Proxy Trigger
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'coverImage' | 'ogImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        body: form
      });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, [targetField]: data.url }));
        if (targetField === 'coverImage' && !formData.ogImage) {
          setFormData(prev => ({ ...prev, ogImage: data.url }));
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  // OpenAI Summary Trigger
  const handleGenerateSummary = async () => {
    if (!formData.title || !formData.content) {
      alert('Please fill out Title and Content first.');
      return;
    }
    setGeneratingSummary(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          id: blog?._id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate summary');
      setFormData(prev => ({ ...prev, aiSummary: data.summary, aiSummaryEnabled: true }));
      setSuccessMsg('AI takeaways generated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'AI generation failed.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  // OpenAI TTS Audio Trigger
  const handleGenerateAudio = async () => {
    if (!formData.title || !formData.content) {
      alert('Please fill out Title and Content first.');
      return;
    }
    setGeneratingAudio(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          id: blog?._id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate speech');
      setFormData(prev => ({ ...prev, audioUrl: data.audioUrl, audioEnabled: true }));
      setSuccessMsg('Audio voice article generated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Audio generation failed.');
    } finally {
      setGeneratingAudio(false);
    }
  };

  // Save/Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    const url = isEdit ? '/api/admin/blogs' : '/api/blogs';
    const method = isEdit ? 'PUT' : 'POST';
    const payload = isEdit ? { ...formData, id: blog._id } : formData;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save article');
      }

      router.push('/admin/blogs');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-sm">
      {/* Title bar controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/blogs"
            className="p-2 border border-border rounded-lg hover:bg-surface text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>
          <div className="space-y-0.5">
            <h1 className="text-3xl font-serif font-black tracking-tight">
              {isEdit ? 'Edit Article' : 'Create Article'}
            </h1>
            <p className="text-muted text-xs font-sans font-medium">
              {isEdit ? `Modifying: ${formData.title}` : 'Draft a new business or tech insights breakdown.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 font-bold bg-primary hover:bg-primary-hover text-primary-foreground transition-colors rounded-lg cursor-pointer disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Article'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg flex items-center gap-2 font-bold font-sans">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg flex items-center gap-2 font-bold font-sans">
          <Check className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Primary Editor Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Editorial Inputs & Tiptap Editor */}
        <div className="lg:col-span-8 space-y-6">
          {/* Article Info Cards */}
          <div className="bg-background border border-border p-6 rounded-lg space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted pb-2 border-b border-border font-sans select-none">
              Core Identity
            </h3>

            <div className="space-y-4 font-sans">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Article Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g. The AI Moat Illusion: Why Models Aren’t Defensible"
                  required
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-base focus:outline-hidden focus:border-primary font-serif font-black text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">URL Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="the-ai-moat-illusion"
                    required
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-hidden focus:border-primary font-mono text-xs text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-hidden focus:border-primary font-bold text-foreground cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Short Excerpt (Summary)</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief 1-2 sentence hook describing what the article is about..."
                  required
                  rows={2}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 focus:outline-hidden focus:border-primary resize-none text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Tiptap rich editor */}
          <div className="space-y-2 font-sans">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted select-none">Article Body Content</label>
            <TiptapEditor content={formData.content} onChange={handleContentChange} />
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted flex items-center justify-between select-none">
              <span>Supports drag & drop images.</span>
              <span>Estimated: {formData.readingTime} min read</span>
            </div>
          </div>

          {/* OpenAI takeaways summary field */}
          <div className="bg-background border border-border p-6 rounded-lg space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted flex items-center gap-1.5 font-sans select-none">
                <Sparkles className="h-4 w-4 text-primary fill-primary" /> Key Takeaways AI Summary
              </h3>
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-border text-foreground hover:bg-surface transition-colors rounded-lg cursor-pointer disabled:opacity-40"
              >
                {generatingSummary ? 'Synthesizing...' : '⚡ Generate AI summary'}
              </button>
            </div>
            <textarea
              name="aiSummary"
              value={formData.aiSummary}
              onChange={handleInputChange}
              placeholder="Generate summary to automatically populate bullet takeaways..."
              rows={5}
              className="w-full bg-background border border-border rounded-lg p-3 focus:outline-hidden focus:border-primary font-mono text-xs resize-none text-foreground"
            />
          </div>
        </div>

        {/* Right Side: Toggles, Uploads, SEO Setup */}
        <div className="lg:col-span-4 space-y-6 font-sans">
          
          {/* Status & Publication Toggles Card */}
          <div className="bg-background border border-border p-6 rounded-lg space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted pb-2 border-b border-border select-none">
              Publish Status
            </h3>

            <div className="divide-y divide-border text-sm">
              <div className="flex items-center justify-between py-3 first:pt-0">
                <span className="font-bold text-foreground">Publish Live</span>
                <button
                  type="button"
                  onClick={() => handleToggle('published')}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                    formData.published ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-background transition-transform ${
                    formData.published ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="font-bold text-foreground">Featured Article</span>
                <button
                  type="button"
                  onClick={() => handleToggle('featured')}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                    formData.featured ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-background transition-transform ${
                    formData.featured ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="font-bold text-foreground">Is Trending</span>
                <button
                  type="button"
                  onClick={() => handleToggle('isTrending')}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                    formData.isTrending ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-background transition-transform ${
                    formData.isTrending ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {formData.isTrending && (
                <div className="py-3 space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted block">Trending Rank (1-5)</label>
                  <input
                    type="number"
                    name="trendingRank"
                    min="1"
                    max="5"
                    value={formData.trendingRank}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-hidden text-foreground"
                  />
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-semibold text-muted">Featured Trending Box</span>
                    <button
                      type="button"
                      onClick={() => handleToggle('featuredTrending')}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                        formData.featuredTrending ? 'bg-primary' : 'bg-border'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-background transition-transform ${
                        formData.featuredTrending ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Media Cover Image Setup */}
          <div className="bg-background border border-border p-6 rounded-lg space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted pb-2 border-b border-border select-none">
              Cover Image
            </h3>

            <div className="space-y-4">
              {formData.coverImage && (
                <div className="aspect-video w-full rounded-md overflow-hidden border border-border bg-background">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.coverImage} alt="Preview" className="object-cover w-full h-full" />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Image URL</label>
                <input
                  type="text"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleInputChange}
                  placeholder="Paste URL..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-primary text-foreground"
                />
              </div>

              <div className="relative">
                <input
                  type="file"
                  id="coverImageUpload"
                  onChange={(e) => handleImageUpload(e, 'coverImage')}
                  accept="image/*"
                  className="hidden"
                />
                <label
                  htmlFor="coverImageUpload"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-border rounded-lg text-xs font-bold text-foreground hover:bg-surface cursor-pointer transition-colors shadow-xs"
                >
                  <Upload className="h-4 w-4 stroke-[1.5]" />
                  <span>{uploadingImage ? 'Uploading image...' : 'Upload cover image'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Audio TTS generator widget */}
          <div className="bg-background border border-border p-6 rounded-lg space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted flex items-center gap-1.5 select-none">
                <Headphones className="h-4 w-4 text-primary" /> Audio Article
              </h3>
              <button
                type="button"
                onClick={handleGenerateAudio}
                disabled={generatingAudio}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-border text-foreground hover:bg-surface transition-colors rounded-lg cursor-pointer disabled:opacity-40"
              >
                {generatingAudio ? 'Compiling...' : '⚡ Generate Speech'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-foreground">Enable Audio Player</span>
                <button
                  type="button"
                  onClick={() => handleToggle('audioEnabled')}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                    formData.audioEnabled ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-background transition-transform ${
                    formData.audioEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Speech URL</label>
                <input
                  type="text"
                  name="audioUrl"
                  value={formData.audioUrl}
                  onChange={handleInputChange}
                  placeholder="Speech URL..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-hidden font-mono text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Tags Setup */}
          <div className="bg-background border border-border p-6 rounded-lg space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted pb-2 border-b border-border select-none">
              Tags Setup
            </h3>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Tags (Comma Separated)</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. AI, Startups, Product"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-primary text-foreground"
              />
            </div>
          </div>

          {/* SEO Meta Fields Setup */}
          <div className="bg-background border border-border p-6 rounded-lg space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted pb-2 border-b border-border select-none">
              SEO Metadata
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">SEO Meta Title</label>
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleInputChange}
                  placeholder="e.g. Linear PLG breakdown"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-hidden text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">SEO Description</label>
                <textarea
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  placeholder="Custom search description override..."
                  rows={2}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-hidden resize-none text-foreground"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
