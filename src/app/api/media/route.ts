import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, deleteImage } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validation: Image files only
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Validation Error: Only image files are allowed.' }, { status: 400 });
    }

    // Validation: 10MB size limit
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Validation Error: File size exceeds the maximum limit of 10MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert to data URI for Cloudinary support
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    const url = await uploadImage(base64Image);
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Image upload handler error:', error);
    return NextResponse.json({ error: error.message || 'Image upload failed' }, { status: 500 });
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
