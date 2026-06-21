import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech } from '@/lib/openai';
import connectDB from '@/lib/db';
import { Blog } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, id } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const audioUrl = await generateSpeech(title, content);

    if (id) {
      try {
        await connectDB();
        await Blog.findByIdAndUpdate(id, { audioUrl, audioEnabled: true });
      } catch (dbError) {
        console.warn('Could not persist audio URL to database:', dbError);
      }
    }

    return NextResponse.json({ audioUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
