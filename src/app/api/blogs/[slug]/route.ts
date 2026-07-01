import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Blog, Author } from '@/lib/models';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    await connectDB();
    const blog = await Blog.findOneAndUpdate(
      { slug, published: true },
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    ).populate('authorId');
    
    if (!blog) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json(blog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
