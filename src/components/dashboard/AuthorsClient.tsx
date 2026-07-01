'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Upload, X, Check, AlertCircle, Globe, Sparkles } from 'lucide-react';

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
  articlesWritten?: number;
}

interface AuthorsClientProps {
  initialAuthors: AuthorType[];
}

export default function AuthorsClient({ initialAuthors }: AuthorsClientProps) {
  const [authors, setAuthors] = useState<AuthorType[]>(initialAuthors);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<AuthorType | null>(null);
  
  // Form Fields State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');

  // Upload States
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Status Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtered Authors
  const filteredAuthors = authors.filter(author => 
    author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    author.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset Form
  const resetForm = () => {
    setName('');
    setRole('');
    setAvatar('');
    setBio('');
    setLinkedin('');
    setTwitter('');
    setWebsite('');
    setEditingAuthor(null);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Open Create Modal
  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (author: AuthorType) => {
    resetForm();
    setEditingAuthor(author);
    setName(author.name);
    setRole(author.role);
    setAvatar(author.avatar);
    setBio(author.bio);
    setLinkedin(author.linkedin || '');
    setTwitter(author.twitter || '');
    setWebsite(author.website || '');
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Handle Avatar Image Upload to Cloudinary using /api/media
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Validation Error: Only image files are allowed.');
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit for avatars
    if (file.size > MAX_SIZE) {
      setErrorMsg('Validation Error: Avatar size exceeds 5MB limit.');
      return;
    }

    setUploading(true);
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
      setUploading(false);
      setUploadProgress(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          setAvatar(data.url);
          setSuccessMsg('Avatar uploaded successfully!');
          setTimeout(() => setSuccessMsg(''), 3000);
        } catch {
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
      e.target.value = '';
    };

    xhr.onerror = () => {
      setUploading(false);
      setUploadProgress(null);
      setErrorMsg('Network error occurred during upload.');
      e.target.value = '';
    };

    xhr.open('POST', '/api/media');
    xhr.send(form);
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !avatar || !bio) {
      setErrorMsg('All fields are required.');
      return;
    }

    setErrorMsg('');
    const isEdit = !!editingAuthor;
    const url = '/api/authors';
    const method = isEdit ? 'PUT' : 'POST';
    const payload = isEdit 
      ? { id: editingAuthor._id, name, role, avatar, bio, linkedin, twitter, website }
      : { name, role, avatar, bio, linkedin, twitter, website };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save author.');
      }

      if (isEdit) {
        setAuthors(prev => prev.map(a => a._id === data._id ? { ...data, articlesWritten: editingAuthor.articlesWritten } : a));
      } else {
        setAuthors(prev => [...prev, { ...data, articlesWritten: 0 }].sort((a, b) => a.name.localeCompare(b.name)));
      }

      closeModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    const targetAuthor = authors.find(a => a._id === id);
    if (!targetAuthor) return;

    if (targetAuthor.articlesWritten && targetAuthor.articlesWritten > 0) {
      alert(`Cannot delete author "${targetAuthor.name}" because they have written ${targetAuthor.articlesWritten} article(s). Please reassign or delete the articles first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete author "${targetAuthor.name}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/authors?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete author.');
      }

      setAuthors(prev => prev.filter(a => a._id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting author.');
    }
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-black tracking-tight">Authors</h1>
          <p className="text-muted text-xs font-sans font-medium">Manage editorial profile cards and social links for article contributors.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover transition-colors rounded-lg cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create Author</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Search authors by name or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 focus:outline-hidden focus:border-primary text-foreground font-medium"
        />
      </div>

      {/* Authors List Table */}
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/30 select-none">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted font-sans">Active Authors</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-surface/10 border-b border-border text-[10px] font-extrabold uppercase tracking-widest text-muted select-none">
                <th className="px-6 py-4">Author Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Articles Written</th>
                <th className="px-6 py-4">Social Profiles</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredAuthors.map((author) => (
                <tr key={author._id} className="hover:bg-surface/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {author.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={author.avatar}
                          alt={author.name}
                          className="h-10 w-10 rounded-full object-cover border border-border shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-primary text-black rounded-full flex items-center justify-center font-bold font-serif text-sm shrink-0 select-none">
                          {author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-foreground">{author.name}</p>
                        <p className="text-[11px] text-muted line-clamp-1 max-w-[280px] font-medium mt-0.5">{author.bio}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">{author.role}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-surface border border-border text-foreground">
                      {author.articlesWritten || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2.5">
                      {author.linkedin ? (
                        <a href={author.linkedin} target="_blank" rel="noopener noreferrer" className="p-1 border border-border rounded-md hover:bg-surface text-muted hover:text-foreground transition-all">
                          <LinkedInIcon className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="p-1 border border-border/30 rounded-md text-muted/30 opacity-40">
                          <LinkedInIcon className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {author.twitter ? (
                        <a href={author.twitter} target="_blank" rel="noopener noreferrer" className="p-1 border border-border rounded-md hover:bg-surface text-muted hover:text-foreground transition-all">
                          <TwitterIcon className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="p-1 border border-border/30 rounded-md text-muted/30 opacity-40">
                          <TwitterIcon className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {author.website ? (
                        <a href={author.website} target="_blank" rel="noopener noreferrer" className="p-1 border border-border rounded-md hover:bg-surface text-muted hover:text-foreground transition-all">
                          <Globe className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="p-1 border border-border/30 rounded-md text-muted/30 opacity-40">
                          <Globe className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(author)}
                        className="p-1.5 border border-border rounded-md hover:bg-surface text-muted hover:text-foreground transition-all cursor-pointer"
                        title="Edit profile"
                      >
                        <Edit2 className="h-3.5 w-3.5 stroke-[1.5]" />
                      </button>
                      <button
                        onClick={() => handleDelete(author._id)}
                        className="p-1.5 border border-border rounded-md hover:bg-red-500/10 text-muted hover:text-red-500 hover:border-red-500/20 transition-all cursor-pointer"
                        title="Delete profile"
                      >
                        <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAuthors.length === 0 && (
          <div className="text-center py-16 text-muted flex items-center justify-center flex-col space-y-2 select-none font-sans font-medium">
            <Plus className="h-8 w-8 text-border" />
            <span>No authors found. Click Create Author above to add one.</span>
          </div>
        )}
      </div>

      {/* Create / Edit Author Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-background border border-border rounded-xl shadow-xl overflow-hidden font-sans my-8">
            <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-surface/20">
              <h3 className="text-base font-serif font-black text-foreground flex items-center gap-1.5 select-none">
                <Sparkles className="h-4.5 w-4.5 text-primary fill-primary" />
                {editingAuthor ? 'Edit Author Profile' : 'Create New Author'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 border border-border hover:bg-surface rounded-lg text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-bold rounded-lg flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Author Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted block">Author Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Saurabh Rathore"
                    required
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-primary text-foreground font-semibold"
                  />
                </div>

                {/* Author Role */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted block">Author Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Founder"
                    required
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-primary text-foreground font-semibold"
                  />
                </div>
              </div>

              {/* Avatar Upload */}
              <div className="space-y-2 border border-border/80 bg-surface/10 p-4 rounded-lg">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted block">Author Avatar Image</label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Avatar Circle Preview */}
                  <div className="h-16 w-16 rounded-full overflow-hidden border border-border bg-surface shrink-0 flex items-center justify-center">
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar} alt="Avatar preview" className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-xs text-muted font-bold font-sans select-none">No Image</span>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        id="avatarUploadInput"
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      <label
                        htmlFor="avatarUploadInput"
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 border border-border rounded-lg text-xs font-bold text-foreground hover:bg-surface cursor-pointer transition-colors shadow-xs select-none"
                      >
                        <Upload className="h-3.5 w-3.5 stroke-[1.5]" />
                        <span>{uploading ? `Uploading... ${uploadProgress !== null ? `${uploadProgress}%` : ''}` : avatar ? 'Replace Avatar' : 'Upload Avatar'}</span>
                      </label>

                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar('')}
                          className="inline-flex items-center justify-center gap-1 px-3.5 py-2 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted">Upload a square image directly to Cloudinary. Maximum 5MB size limit.</p>
                  </div>
                </div>
              </div>

              {/* Author Bio */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-muted">
                  <label>Author Bio</label>
                  <span>{bio.length}/200</span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 200))}
                  placeholder="Founder, product designer, and startup enthusiast writing about AI..."
                  required
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:outline-hidden focus:border-primary text-foreground resize-none leading-relaxed"
                />
              </div>

              {/* Social Links */}
              <div className="space-y-3 pt-2 border-t border-border">
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted select-none">Social Profiles (Optional)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted uppercase">LinkedIn</label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/..."
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-primary text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted uppercase">X (Twitter)</label>
                    <input
                      type="url"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="https://x.com/..."
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-primary text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted uppercase">Website</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-primary text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-bold text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover transition-colors rounded-lg cursor-pointer disabled:opacity-40"
                >
                  <span>{editingAuthor ? 'Save Changes' : 'Create Author'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
