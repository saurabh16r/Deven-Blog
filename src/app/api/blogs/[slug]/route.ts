import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Blog } from '@/lib/models';
import { mockBlogs } from '../route';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    try {
      await connectDB();
      const blog = await Blog.findOneAndUpdate(
        { slug, published: true },
        { $inc: { views: 1 } },
        { returnDocument: 'after' }
      );
      
      if (!blog) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      return NextResponse.json(blog);
    } catch (dbError) {
      console.warn('Database error fetching single slug, using mock dataset', dbError);
      const blogIndex = mockBlogs.findIndex(b => b.slug === slug);
      if (blogIndex === -1) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      // Simulate view count increment in mock database
      mockBlogs[blogIndex].views += 1;
      return NextResponse.json(mockBlogs[blogIndex]);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
