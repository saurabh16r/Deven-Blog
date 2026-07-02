import { NextRequest, NextResponse } from 'next/server';
import { uploadAudio } from '@/lib/cloudinary';

export const maxDuration = 60; // Allow enough execution time for large audio files if running on Vercel/similar

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Validation: MP3, WAV, M4A only
    const filename = file.name.toLowerCase();
    const isSupportedExtension = filename.endsWith('.mp3') || filename.endsWith('.wav') || filename.endsWith('.m4a');
    
    if (!isSupportedExtension) {
      return NextResponse.json(
        { error: 'Validation Error: Only .mp3, .wav, and .m4a audio files are allowed.' },
        { status: 400 }
      );
    }

    // Validation: 100MB size limit
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Validation Error: File size exceeds the maximum limit of 100MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert to data URI for Cloudinary support
    const base64Audio = `data:${file.type || 'audio/mpeg'};base64,${buffer.toString('base64')}`;

    const { secure_url, duration, public_id } = await uploadAudio(base64Audio);
    return NextResponse.json({ secure_url, duration, public_id });
  } catch (error: any) {
    console.error('Audio upload handler error:', error);
    return NextResponse.json(
      { error: error.message || 'Audio upload failed.' },
      { status: 500 }
    );
  }
}
