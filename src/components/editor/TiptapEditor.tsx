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
import React from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
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
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        editor.chain().focus().setImage({ src: data.url }).run();
      }
    } catch (err) {
      console.error('Drag and drop upload failed:', err);
    }
  };

  return (
    <div 
      className="border border-border rounded-xl bg-background overflow-hidden focus-within:border-primary/60 transition-colors"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
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

      {/* Editor Content Area */}
      <div className="p-4 sm:p-6 bg-background min-h-[300px] cursor-text">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
