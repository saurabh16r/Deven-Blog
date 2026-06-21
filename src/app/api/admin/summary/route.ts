import { NextRequest, NextResponse } from 'next/server';
import { generateSummary } from '@/lib/openai';
import connectDB from '@/lib/db';
import { Blog } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, id } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const summary = await generateSummary(title, content);

    if (id) {
      try {
        await connectDB();
        await Blog.findByIdAndUpdate(id, { aiSummary: summary });
      } catch (dbError) {
        console.warn('Could not persist AI summary to database:', dbError);
      }
    }

    return NextResponse.json({ summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
