'use client';

import React, { useState, useRef } from 'react';
import { Upload, Copy, Check, Trash2, Search, ImageIcon } from 'lucide-react';

interface ImageAsset {
  id: string;
  url: string;
  name: string;
  size?: string;
}

export default function MediaClient() {
  // A stock collection of Unsplash images
  const [images, setImages] = useState<ImageAsset[]>([
    { id: 'img-1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', name: 'abstract_waves.jpg', size: '242 KB' },
    { id: 'img-2', url: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?auto=format&fit=crop&w=800&q=80', name: 'dark_neon_blocks.jpg', size: '185 KB' },
    { id: 'img-3', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80', name: 'stripe_payment_mockup.jpg', size: '310 KB' },
    { id: 'img-4', url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80', name: 'currency_coins_startup.jpg', size: '190 KB' },
    { id: 'img-5', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80', name: 'operations_blueprint.jpg', size: '280 KB' },
    { id: 'img-6', url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80', name: 'morning_brew_paper.jpg', size: '155 KB' }
  ]);
  
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        const newAsset: ImageAsset = {
          id: `img-${Date.now()}`,
          url: data.url,
          name: file.name,
          size: `${Math.round(file.size / 1024)} KB`
        };
        setImages(prev => [newAsset, ...prev]);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media asset?')) return;
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredImages = images.filter(img =>
    img.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-black tracking-tight">Media Library</h1>
          <p className="text-muted text-xs font-sans font-medium">Upload, search, and copy asset URLs.</p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-primary hover:bg-primary-hover text-primary-foreground transition-all rounded-lg cursor-pointer disabled:opacity-50"
          >
            <Upload className="h-4.5 w-4.5" />
            <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
          </button>
        </div>
      </div>

      {/* Searching Bar */}
      <div className="relative max-w-md w-full">
        <input
          type="text"
          placeholder="Search by filename..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-hidden focus:border-primary shadow-xs font-sans text-foreground"
        />
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
      </div>

      {/* Grid view of images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 font-sans">
        {filteredImages.map((img) => (
          <div
            key={img.id}
            className="bg-background border border-border rounded-lg overflow-hidden flex flex-col justify-between"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-surface border-b border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.name}
                className="object-cover w-full h-full hover:scale-101 transition-transform"
              />
            </div>
            
            <div className="p-4 space-y-3.5">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground truncate" title={img.name}>
                  {img.name}
                </p>
                {img.size && (
                  <p className="text-[10px] text-muted font-bold">
                    Size: {img.size}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(img.id, img.url)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground hover:bg-surface transition-colors cursor-pointer"
                >
                  {copiedId === img.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-green-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-2 border border-border rounded-lg bg-background text-muted hover:text-red-500 hover:border-red-500/20 transition-colors cursor-pointer"
                  title="Delete Image"
                >
                  <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-20 border border-dashed border-border rounded-lg bg-background flex flex-col items-center justify-center space-y-2 text-muted font-semibold">
          <ImageIcon className="h-8 w-8 text-border" />
          <span>No image assets found. Upload your first image top-right.</span>
        </div>
      )}
    </div>
  );
}
