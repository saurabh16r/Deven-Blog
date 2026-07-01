'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TiptapEditor from './TiptapEditor';
import { slugify, calculateReadingTime } from '@/lib/utils';
import { Save, Sparkles, Headphones, Upload, ArrowLeft, Check, AlertCircle, X, Globe, ChevronDown, Search, User, Plus } from 'lucide-react';
import Link from 'next/link';

const LinkedInIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const TwitterIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface AuthorType {
  _id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

interface BlogType {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  authorId: string;
  
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
  authors: AuthorType[];
}

export default function BlogEditForm({ blog, categories, authors }: BlogEditFormProps) {
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
    authorId: typeof blog?.authorId === 'object' && blog.authorId ? (blog.authorId as any)._id : (blog?.authorId || authors[0]?._id || ''),
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

  // Author selection & creation states
  const [localAuthors, setLocalAuthors] = useState<AuthorType[]>(authors);
  const [authorSearch, setAuthorSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorRole, setNewAuthorRole] = useState('');
  const [newAuthorAvatar, setNewAuthorAvatar] = useState('');
  const [newAuthorBio, setNewAuthorBio] = useState('');
  const [newAuthorLinkedin, setNewAuthorLinkedin] = useState('');
  const [newAuthorTwitter, setNewAuthorTwitter] = useState('');
  const [newAuthorWebsite, setNewAuthorWebsite] = useState('');
  const [authorUploading, setAuthorUploading] = useState(false);
  const [authorUploadProgress, setAuthorUploadProgress] = useState<number | null>(null);
  const [authorError, setAuthorError] = useState('');
  const [authorSuccess, setAuthorSuccess] = useState('');

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [tagInput, setTagInput] = useState(blog?.tags.join(', ') || '');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
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
        next.seoTitle = `${val} - Deven`;
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
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: 'coverImage' | 'ogImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset feedback messages
    setErrorMsg('');
    setSuccessMsg('');

    // Client-side validation: Type check
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Validation Error: Only image files are allowed.');
      if (e.target) e.target.value = '';
      return;
    }

    // Client-side validation: Size check (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg('Validation Error: File size exceeds the maximum limit of 10MB.');
      if (e.target) e.target.value = '';
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0);

    const form = new FormData();
    form.append('file', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    });

    xhr.onload = () => {
      setUploadingImage(false);
      setUploadProgress(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          setFormData(prev => ({ ...prev, [targetField]: data.url }));
          if (targetField === 'coverImage' && !formData.ogImage) {
            setFormData(prev => ({ ...prev, ogImage: data.url }));
          }
          setSuccessMsg('Image uploaded successfully to Cloudinary!');
          setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
          setErrorMsg('Upload failed: Invalid response from server.');
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setErrorMsg(data.error || 'Upload failed.');
        } catch {
          setErrorMsg(`Upload failed with status code ${xhr.status}.`);
        }
      }
      if (e.target) e.target.value = '';
    };

    xhr.onerror = () => {
      setUploadingImage(false);
      setUploadProgress(null);
      setErrorMsg('Network error occurred during upload.');
      if (e.target) e.target.value = '';
    };

    xhr.open('POST', '/api/media');
    xhr.send(form);
  };

  // Upload Author Avatar directly to Cloudinary
  const handleAuthorAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAuthorError('');

    if (!file.type.startsWith('image/')) {
      setAuthorError('Validation Error: Only image files are allowed.');
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setAuthorError('Validation Error: File size exceeds the maximum limit of 5MB.');
      return;
    }

    setAuthorUploading(true);
    setAuthorUploadProgress(0);

    const form = new FormData();
    form.append('file', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setAuthorUploadProgress(percent);
      }
    });

    xhr.onload = () => {
      setAuthorUploading(false);
      setAuthorUploadProgress(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          setNewAuthorAvatar(data.url);
        } catch (err) {
          setAuthorError('Upload failed: Invalid response from server.');
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setAuthorError(data.error || 'Upload failed.');
        } catch {
          setAuthorError(`Upload failed with status code ${xhr.status}.`);
        }
      }
    };

    xhr.onerror = () => {
      setAuthorUploading(false);
      setAuthorUploadProgress(null);
      setAuthorError('Network error occurred during upload.');
    };

    xhr.open('POST', '/api/media');
    xhr.send(form);
  };

  // Submit new author form
  const handleCreateAuthorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthorName || !newAuthorRole || !newAuthorAvatar || !newAuthorBio) {
      setAuthorError('Name, role, avatar, and bio are required.');
      return;
    }
    setAuthorError('');
    setAuthorSuccess('');
    
    try {
      const res = await fetch('/api/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAuthorName,
          role: newAuthorRole,
          avatar: newAuthorAvatar,
          bio: newAuthorBio,
          linkedin: newAuthorLinkedin,
          twitter: newAuthorTwitter,
          website: newAuthorWebsite
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create author.');
      }
      
      // Update local authors list
      setLocalAuthors(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      // Select the new author automatically
      setFormData(prev => ({ ...prev, authorId: data._id }));
      
      // Reset new author states
      setNewAuthorName('');
      setNewAuthorRole('');
      setNewAuthorAvatar('');
      setNewAuthorBio('');
      setNewAuthorLinkedin('');
      setNewAuthorTwitter('');
      setNewAuthorWebsite('');
      
      setAuthorSuccess('Author created and selected successfully!');
      setTimeout(() => {
        setIsAuthorModalOpen(false);
        setAuthorSuccess('');
      }, 1500);
    } catch (err: any) {
      setAuthorError(err.message || 'Something went wrong.');
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

          {/* Author Information Card */}
          <div className="bg-background border border-border p-6 rounded-lg space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted pb-2 border-b border-border font-sans select-none">
              Author Information
            </h3>
            
            <div className="space-y-4 font-sans relative" ref={dropdownRef}>
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Select Article Author</label>
                
                {/* Searchable Dropdown Selector Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center justify-between bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-surface/30 cursor-pointer transition-all"
                  >
                    {(() => {
                      const selectedAuth = localAuthors.find(a => a._id === formData.authorId);
                      if (selectedAuth) {
                        return (
                          <div className="flex items-center space-x-2.5">
                            {selectedAuth.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={selectedAuth.avatar} alt={selectedAuth.name} className="h-6 w-6 rounded-full object-cover border border-border" />
                            ) : (
                              <div className="h-6 w-6 bg-primary text-black rounded-full flex items-center justify-center font-bold font-serif text-[10px] select-none">
                                {selectedAuth.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                            )}
                            <span className="font-bold">{selectedAuth.name} ({selectedAuth.role})</span>
                          </div>
                        );
                      }
                      return <span className="text-muted">Choose an author...</span>;
                    })()}
                    <ChevronDown className={`h-4 w-4 text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Options Box */}
                  {dropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1.5 z-40 bg-background border border-border rounded-lg shadow-xl overflow-hidden divide-y divide-border">
                      {/* Search Bar */}
                      <div className="p-2 bg-surface/20 flex items-center space-x-2">
                        <Search className="h-3.5 w-3.5 text-muted shrink-0" />
                        <input
                          type="text"
                          placeholder="Search contributors..."
                          value={authorSearch}
                          onChange={(e) => setAuthorSearch(e.target.value)}
                          className="w-full bg-transparent border-0 outline-hidden text-xs text-foreground placeholder-muted font-medium"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      {/* Options List */}
                      <div className="max-h-56 overflow-y-auto divide-y divide-border/50">
                        {localAuthors
                          .filter(a => a.name.toLowerCase().includes(authorSearch.toLowerCase()) || a.role.toLowerCase().includes(authorSearch.toLowerCase()))
                          .map((author) => (
                            <button
                              key={author._id}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, authorId: author._id }));
                                setDropdownOpen(false);
                                setAuthorSearch('');
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs text-left hover:bg-surface/50 cursor-pointer transition-colors ${formData.authorId === author._id ? 'bg-surface font-bold text-foreground border-l-[3px] border-primary' : 'text-muted'}`}
                            >
                              <div className="flex items-center space-x-2.5">
                                {author.avatar ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={author.avatar} alt={author.name} className="h-5.5 w-5.5 rounded-full object-cover border border-border" />
                                ) : (
                                  <div className="h-5.5 w-5.5 bg-primary text-black rounded-full flex items-center justify-center font-bold font-serif text-[9px] select-none">
                                    {author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-foreground">{author.name}</p>
                                  <p className="text-[10px] text-muted">{author.role}</p>
                                </div>
                              </div>
                              {formData.authorId === author._id && <Check className="h-3.5 w-3.5 text-primary" />}
                            </button>
                          ))
                        }

                        {localAuthors.filter(a => a.name.toLowerCase().includes(authorSearch.toLowerCase()) || a.role.toLowerCase().includes(authorSearch.toLowerCase())).length === 0 && (
                          <div className="px-3 py-4 text-xs text-center text-muted font-medium select-none">
                            No contributors found.
                          </div>
                        )}
                      </div>

                      {/* Modal Trigger Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsAuthorModalOpen(true);
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-bold text-primary hover:bg-surface/50 border-t border-border cursor-pointer transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Create New Author...</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Author Preview Card */}
              {(() => {
                const currentAuthor = localAuthors.find(a => a._id === formData.authorId);
                if (!currentAuthor) return null;
                return (
                  <div className="mt-4 border border-border/80 bg-surface/10 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-start">
                    {currentAuthor.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={currentAuthor.avatar} alt={currentAuthor.name} className="h-14 w-14 rounded-full object-cover border border-border shrink-0" />
                    ) : (
                      <div className="h-14 w-14 bg-primary text-black rounded-full flex items-center justify-center font-bold font-serif text-sm shrink-0 select-none">
                        {currentAuthor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                    )}
                    <div className="flex-grow space-y-1.5">
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{currentAuthor.name}</h4>
                        <p className="text-xs font-semibold text-muted tracking-wide uppercase">{currentAuthor.role}</p>
                      </div>
                      <p className="text-xs text-muted leading-relaxed font-medium line-clamp-2 max-w-xl">{currentAuthor.bio}</p>
                      
                      {(currentAuthor.linkedin || currentAuthor.twitter || currentAuthor.website) && (
                        <div className="flex items-center space-x-3 pt-1 text-[10px] font-bold text-muted uppercase tracking-wider">
                          {currentAuthor.linkedin && (
                            <a href={currentAuthor.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
                              <LinkedInIcon className="h-3.5 w-3.5" /> LinkedIn
                            </a>
                          )}
                          {currentAuthor.twitter && (
                            <a href={currentAuthor.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
                              <TwitterIcon className="h-3.5 w-3.5" /> X (Twitter)
                            </a>
                          )}
                          {currentAuthor.website && (
                            <a href={currentAuthor.website} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
                              <Globe className="h-3 w-3" /> Website
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
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
                  <span>{uploadingImage ? `Uploading image... ${uploadProgress !== null ? `${uploadProgress}%` : ''}` : 'Upload cover image'}</span>
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

      {/* Create New Author Modal */}
      {isAuthorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-background border border-border rounded-xl shadow-xl overflow-hidden font-sans my-8">
            <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-surface/20">
              <h3 className="text-base font-serif font-black text-foreground flex items-center gap-1.5 select-none">
                <Sparkles className="h-4.5 w-4.5 text-primary fill-primary" />
                Create New Author
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAuthorModalOpen(false);
                  setAuthorError('');
                  setAuthorSuccess('');
                }}
                className="p-1.5 border border-border hover:bg-surface rounded-lg text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {authorError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{authorError}</span>
                </div>
              )}

              {authorSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-bold rounded-lg flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{authorSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted block font-sans">Author Name</label>
                  <input
                    type="text"
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    placeholder="e.g. Saurabh Rathore"
                    required
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-primary text-foreground font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted block font-sans">Author Role</label>
                  <input
                    type="text"
                    value={newAuthorRole}
                    onChange={(e) => setNewAuthorRole(e.target.value)}
                    placeholder="e.g. Founder"
                    required
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-primary text-foreground font-semibold"
                  />
                </div>
              </div>

              {/* Avatar Upload */}
              <div className="space-y-2 border border-border/80 bg-surface/10 p-4 rounded-lg">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted block font-sans">Author Avatar Image</label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden border border-border bg-surface shrink-0 flex items-center justify-center">
                    {newAuthorAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={newAuthorAvatar} alt="Avatar preview" className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-xs text-muted font-bold font-sans select-none">No Image</span>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        id="authorAvatarUploadInput"
                        onChange={handleAuthorAvatarUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      <label
                        htmlFor="authorAvatarUploadInput"
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 border border-border rounded-lg text-xs font-bold text-foreground hover:bg-surface cursor-pointer transition-colors shadow-xs select-none"
                      >
                        <Upload className="h-3.5 w-3.5 stroke-[1.5]" />
                        <span>{authorUploading ? `Uploading... ${authorUploadProgress !== null ? `${authorUploadProgress}%` : ''}` : newAuthorAvatar ? 'Replace Avatar' : 'Upload Avatar'}</span>
                      </label>

                      {newAuthorAvatar && (
                        <button
                          type="button"
                          onClick={() => setNewAuthorAvatar('')}
                          className="inline-flex items-center justify-center gap-1 px-3.5 py-2 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted font-sans">Upload a square image directly to Cloudinary. Maximum 5MB size limit.</p>
                  </div>
                </div>
              </div>

              {/* Author Bio */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-muted font-sans">
                  <label>Author Bio</label>
                  <span>{newAuthorBio.length}/200</span>
                </div>
                <textarea
                  value={newAuthorBio}
                  onChange={(e) => setNewAuthorBio(e.target.value.slice(0, 200))}
                  placeholder="Founder, product designer, and startup enthusiast writing about AI..."
                  required
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:outline-hidden focus:border-primary text-foreground resize-none leading-relaxed"
                />
              </div>

              {/* Social Links */}
              <div className="space-y-3 pt-2 border-t border-border">
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted select-none font-sans">Social Profiles (Optional)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted uppercase font-sans">LinkedIn</label>
                    <input
                      type="url"
                      value={newAuthorLinkedin}
                      onChange={(e) => setNewAuthorLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/..."
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-primary text-foreground font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted uppercase font-sans">X (Twitter)</label>
                    <input
                      type="url"
                      value={newAuthorTwitter}
                      onChange={(e) => setNewAuthorTwitter(e.target.value)}
                      placeholder="https://x.com/..."
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-primary text-foreground font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted uppercase font-sans">Website</label>
                    <input
                      type="url"
                      value={newAuthorWebsite}
                      onChange={(e) => setNewAuthorWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-primary text-foreground font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthorModalOpen(false);
                    setAuthorError('');
                    setAuthorSuccess('');
                  }}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-bold text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateAuthorSubmit}
                  disabled={authorUploading}
                  className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover transition-colors rounded-lg cursor-pointer disabled:opacity-40"
                >
                  Create Author
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
