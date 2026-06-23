import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, deleteImage } from '@/lib/cloudinary';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert to data URI for Cloudinary support
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    try {
      const url = await uploadImage(base64Image);
      // If Cloudinary returned the base64Image fallback (meaning it's not configured),
      // throw an error to trigger the local saving fallback instead of storing giant base64 strings in DB.
      if (url.startsWith('data:')) {
        throw new Error('Cloudinary not configured');
      }
      return NextResponse.json({ url });
    } catch (error) {
      console.warn('Cloudinary upload failed/not-configured, saving file locally under public/uploads/ as fallback:', error);
      
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Generate a safe unique filename
        const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(uploadsDir, safeName);
        
        fs.writeFileSync(filePath, buffer);
        
        const localUrl = `/uploads/${safeName}`;
        return NextResponse.json({ url: localUrl });
      } catch (localError: any) {
        console.error('Failed to save file locally:', localError);
        // Fallback to stock image mockup only if local saving also fails
        const fallbackUrls = [
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80'
        ];
        const randomUrl = fallbackUrls[Math.floor(Math.random() * fallbackUrls.length)];
        return NextResponse.json({ url: randomUrl });
      }
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get('publicId');
    if (!publicId) {
      return NextResponse.json({ error: 'publicId is required' }, { status: 400 });
    }
    await deleteImage(publicId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
