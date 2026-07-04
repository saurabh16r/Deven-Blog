'use client';

import React, { useState, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onCancel: () => void;
  onSave: (croppedBlob: Blob) => void;
}

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  onCancel,
  onSave,
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [baseSize, setBaseSize] = useState({ w: 0, h: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Viewport dimensions in UI (Circle mask is 240x240)
  const VIEWPORT_SIZE = 240;

  if (!isOpen) return null;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const ratio = naturalWidth / naturalHeight;

    let w = 0;
    let h = 0;

    // Fit image to completely cover the cropping viewport by default
    if (ratio >= 1) {
      // Landscape: height matches viewport, width scales up
      h = VIEWPORT_SIZE;
      w = VIEWPORT_SIZE * ratio;
    } else {
      // Portrait: width matches viewport, height scales up
      w = VIEWPORT_SIZE;
      h = VIEWPORT_SIZE / ratio;
    }

    setBaseSize({ w, h });
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const container = e.currentTarget;
    container.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Fallback
    }
  };

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleSave = () => {
    const img = imgRef.current;
    if (!img || baseSize.w === 0 || baseSize.h === 0) return;

    const canvas = document.createElement('canvas');
    // High-res cropped output
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configure high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Center the canvas context origin
    ctx.translate(250, 250);

    // 2. Conversion ratio from UI (VIEWPORT_SIZE) to high-res canvas (500)
    const scaleFactor = 500 / VIEWPORT_SIZE;

    // 3. Apply translations in canvas coordinates
    ctx.translate(offset.x * scaleFactor, offset.y * scaleFactor);

    // 4. Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // 5. Apply zoom and UI-to-canvas scale scaling
    ctx.scale(zoom * scaleFactor, zoom * scaleFactor);

    // 6. Draw centered base size image
    ctx.drawImage(img, -baseSize.w / 2, -baseSize.h / 2, baseSize.w, baseSize.h);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onSave(blob);
        }
      },
      'image/jpeg',
      0.95
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="cropper-title"
        className="relative w-full max-w-md bg-background border border-border rounded-xl shadow-2xl p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-200 text-foreground"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 id="cropper-title" className="font-serif font-black text-xl tracking-tight">
            Crop Photo
          </h3>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg border border-transparent hover:border-border hover:bg-surface text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close Crop Modal"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Cropping Canvas Frame */}
        <div className="relative flex justify-center items-center">
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full aspect-square max-w-[320px] bg-neutral-900 dark:bg-neutral-950 overflow-hidden relative rounded-lg border border-border flex items-center justify-center select-none cursor-grab active:cursor-grabbing touch-none"
            style={{ touchAction: 'none' }}
          >
            {/* Viewport circular mask */}
            <div 
              className="absolute rounded-full border-2 border-white/50 pointer-events-none shadow-[0_0_0_999px_rgba(0,0,0,0.75)] z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: `${VIEWPORT_SIZE}px`,
                height: `${VIEWPORT_SIZE}px`,
              }}
            />

            {/* Image Preview */}
            {imageSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Upload Crop Preview"
                onLoad={handleImageLoad}
                style={{
                  width: baseSize.w ? `${baseSize.w}px` : 'auto',
                  height: baseSize.h ? `${baseSize.h}px` : 'auto',
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                }}
                className="absolute left-1/2 top-1/2 pointer-events-none select-none max-w-none max-h-none transition-transform duration-75"
              />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="h-4.5 w-4.5 text-muted shrink-0" />
            <input
              type="range"
              min="1"
              max="4"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              aria-label="Zoom profile image"
              className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <ZoomIn className="h-4.5 w-4.5 text-muted shrink-0" />
          </div>

          {/* Quick Rotation */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleRotate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-surface rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Rotate 90°</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-border hover:bg-surface rounded-lg text-xs font-bold text-muted hover:text-foreground transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}
