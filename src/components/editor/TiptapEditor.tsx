'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Link2,
  Image as ImageIcon,
  Code
} from 'lucide-react';
import React, { useState } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-6 border border-border shadow-xs'
        }
      })
    ],
    content: content || '<p>Start writing your startup insights breakdown...</p>',
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    immediatelyRender: false
  });

  if (!editor) return null;

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL:', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL (or upload in Media Library and paste here):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Drag and Drop Upload Handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Client-side validation: Type check
    if (!file.type.startsWith('image/')) {
      setUploadError('Validation Error: Only image files are allowed.');
      return;
    }

    // Client-side validation: Size check (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError('Validation Error: File size exceeds the maximum limit of 10MB.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

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
          editor.chain().focus().setImage({ src: data.url }).run();
        } catch (err) {
          setUploadError('Upload failed: Invalid response from server.');
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setUploadError(data.error || 'Upload failed.');
        } catch {
          setUploadError(`Upload failed with status code ${xhr.status}.`);
        }
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setUploadProgress(null);
      setUploadError('Network error occurred during upload.');
    };

    xhr.open('POST', '/api/media');
    xhr.send(formData);
  };

  return (
    <div 
      className="relative border border-border rounded-xl bg-background overflow-hidden focus-within:border-primary/60 transition-colors"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {uploading && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-xs flex flex-col items-center justify-center z-50 space-y-3 font-sans">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-xs font-bold text-foreground">
            Uploading image... {uploadProgress !== null ? `${uploadProgress}%` : ''}
          </span>
        </div>
      )}

      {/* Rich Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-surface border-b border-border text-muted-foreground shrink-0">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-md hover:bg-surface-hover hover:text-foreground cursor-pointer ${
            editor.isActive('bold') ? 'bg-primary/20 text-foreground font-bold' : ''
          }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-md hover:bg-surface-hover hover:text-foreground cursor-pointer ${
            editor.isActive('italic') ? 'bg-primary/20 text-foreground font-bold' : ''
          }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>

        <span className="w-[1px] h-4 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-md hover:bg-surface-hover hover:text-foreground cursor-pointer ${
            editor.isActive('heading', { level: 2 }) ? 'bg-primary/20 text-foreground font-bold' : ''
          }`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded-md hover:bg-surface-hover hover:text-foreground cursor-pointer ${
            editor.isActive('heading', { level: 3 }) ? 'bg-primary/20 text-foreground font-bold' : ''
          }`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <span className="w-[1px] h-4 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-md hover:bg-surface-hover hover:text-foreground cursor-pointer ${
            editor.isActive('bulletList') ? 'bg-primary/20 text-foreground font-bold' : ''
          }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-md hover:bg-surface-hover hover:text-foreground cursor-pointer ${
            editor.isActive('orderedList') ? 'bg-primary/20 text-foreground font-bold' : ''
          }`}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-md hover:bg-surface-hover hover:text-foreground cursor-pointer ${
            editor.isActive('blockquote') ? 'bg-primary/20 text-foreground font-bold' : ''
          }`}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </button>

        <span className="w-[1px] h-4 bg-border mx-1" />

        <button
          type="button"
          onClick={toggleLink}
          className={`p-1.5 rounded-md hover:bg-surface-hover hover:text-foreground cursor-pointer ${
            editor.isActive('link') ? 'bg-primary/20 text-foreground font-bold' : ''
          }`}
          title="Insert Link"
        >
          <Link2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={addImage}
          className="p-1.5 rounded-md hover:bg-surface-hover hover:text-foreground cursor-pointer"
          title="Insert Image URL"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
      </div>

      {uploadError && (
        <div className="bg-red-500/10 border-b border-red-500/30 text-red-500 px-4 py-2 text-xs font-sans font-semibold flex items-center justify-between">
          <span>⚠️ {uploadError}</span>
          <button onClick={() => setUploadError(null)} className="hover:text-red-400 font-bold select-none cursor-pointer">✕</button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="p-4 sm:p-6 bg-background min-h-[300px] cursor-text">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
